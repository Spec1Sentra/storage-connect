import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { supabaseAdmin } from "../_shared/supabase-client.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get user from Authorization header
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: userError } = await userClient.auth.getUser()

    if (userError) throw userError
    if (!user) throw new Error('User not found')

    // 2. Parse request body
    const {
      filename,
      bucket = 'item-raw',
      expiry_seconds = 3600
    } = await req.json()

    if (!filename) {
      throw new Error("Missing 'filename' in request body")
    }

    // 3. Create a unique path for the file, scoped to the user
    const filePath = `${user.id}/${Date.now()}-${filename}`

    // 4. Generate signed upload URL using the admin client
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(filePath, expiry_seconds)

    if (error) {
      console.error('Error creating signed URL:', error)
      throw error
    }

    // 5. Return the signed URL and the final path
    // The client will need the 'path' to store in the database later.
    return new Response(JSON.stringify({ ...data, path: filePath }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
