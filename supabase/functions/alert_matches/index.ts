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
    // This function can be triggered after an item and its tags are created.
    const { item_id } = await req.json()
    if (!item_id) throw new Error("Missing 'item_id' in request body")

    // Call the database function to handle the complex logic
    const { error } = await supabaseAdmin.rpc('find_and_alert_matches', { p_item_id: item_id })
    if (error) {
      console.error("Error calling find_and_alert_matches RPC:", error)
      throw error
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in alert_matches function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
