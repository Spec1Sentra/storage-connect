import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseAdmin } from "../_shared/supabase-client.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const params = await req.json()

    // Call the database function
    const { data, error } = await supabaseAdmin.rpc('search_items', {
      query_text: params.q,
      tag_names: params.tags,
      in_lat: params.lat,
      in_lng: params.lng,
      radius_km: params.radius_km,
      query_embedding: params.visual_query_embedding,
      similarity_threshold: params.similarity_threshold,
      match_limit: params.limit,
      match_offset: params.offset,
    })

    if (error) {
      console.error('Error calling search_items RPC:', error)
      throw error
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("Error in search_items function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
