import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseAdmin } from "../_shared/supabase-client.ts"

console.log("expire_listings function starting up...")

serve(async (_req) => {
  try {
    // This function is designed to be called by a cron job.
    // It finds active items that are past their expiration date and updates their status.
    const now = new Date().toISOString()

    const { data, error, count } = await supabaseAdmin
      .from('items')
      .update({ status: 'expired' })
      .lt('expires_at', now)
      .eq('status', 'active')
      .select()

    if (error) {
      console.error("Error expiring items:", error)
      throw error
    }

    const result = { success: true, expired_count: count || 0 }
    console.log(`Expired ${count || 0} items.`)

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in expire_listings function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
