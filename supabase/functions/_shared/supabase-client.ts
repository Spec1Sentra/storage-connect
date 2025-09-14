// supabase/functions/_shared/supabase-client.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Note: These environment variables are automatically supplied by the Supabase platform.
// When running locally, you can use a .env file.
const supabaseUrl = Deno.env.get('SUPABASE_URL')
if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is not set.")
}

const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set.")
}

/**
 * A Supabase client with the service_role key.
 * Use this for administrative tasks that require bypassing RLS.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
