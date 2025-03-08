import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { ip } = await req.json();
    
    if (!ip) {
      throw new Error('IP address is required');
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Call the unblock_ip function
    const { error } = await supabase.rpc('unblock_ip', {
      target_ip_address: ip
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'IP successfully unblocked' }), 
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});