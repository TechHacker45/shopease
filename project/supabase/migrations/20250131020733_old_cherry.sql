-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.refresh_materialized_views();

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void AS $$
BEGIN
  -- Refresh blocked IPs view
  REFRESH MATERIALIZED VIEW public.blocked_ips_view;
  
  -- Refresh attack types view
  REFRESH MATERIALIZED VIEW public.attack_types_view;
  
  -- Return success message
  RAISE NOTICE 'Successfully refreshed materialized views';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.refresh_materialized_views() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_materialized_views() TO anon;

-- Create trigger to automatically refresh views on data changes
CREATE OR REPLACE FUNCTION refresh_views_on_change()
RETURNS trigger AS $$
BEGIN
  -- Refresh the materialized views
  PERFORM public.refresh_materialized_views();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on request_logs table
DROP TRIGGER IF EXISTS refresh_views_trigger ON request_logs;
CREATE TRIGGER refresh_views_trigger
AFTER INSERT OR UPDATE OR DELETE ON request_logs
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_views_on_change();

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';