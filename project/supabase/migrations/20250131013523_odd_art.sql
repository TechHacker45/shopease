/*
  # Add Refresh Materialized Views Function

  1. New Functions
    - `refresh_materialized_views()`: Refreshes all materialized views concurrently
  
  2. Security
    - Function is marked as SECURITY DEFINER to run with elevated privileges
    - Execute permission granted to authenticated and anon roles
*/

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.blocked_ips_view;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.attack_types_view;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.refresh_materialized_views() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_materialized_views() TO anon;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';