/*
  # Fix materialized views for WAF statistics
  
  1. Changes
    - Safely recreate materialized views if they exist
    - Add refresh function and trigger
    - Add performance indexes
  
  2. Security
    - Grant appropriate permissions to authenticated users
*/

-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS refresh_stats_views_trigger ON request_logs;
DROP FUNCTION IF EXISTS refresh_stats_views();
DROP MATERIALIZED VIEW IF EXISTS blocked_ips_view;
DROP MATERIALIZED VIEW IF EXISTS attack_types_view;

-- Create materialized views
CREATE MATERIALIZED VIEW IF NOT EXISTS blocked_ips_view AS
SELECT 
  ip,
  COUNT(*) as count
FROM request_logs
WHERE is_threat = true
GROUP BY ip;

CREATE MATERIALIZED VIEW IF NOT EXISTS attack_types_view AS
SELECT 
  threat_type,
  COUNT(*) as count
FROM request_logs
WHERE is_threat = true
  AND threat_type IS NOT NULL
GROUP BY threat_type;

-- Grant access to authenticated users
GRANT SELECT ON blocked_ips_view TO authenticated;
GRANT SELECT ON attack_types_view TO authenticated;

-- Create function to refresh the views
CREATE OR REPLACE FUNCTION refresh_stats_views()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY blocked_ips_view;
  REFRESH MATERIALIZED VIEW CONCURRENTLY attack_types_view;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh views when request_logs changes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'refresh_stats_views_trigger'
  ) THEN
    CREATE TRIGGER refresh_stats_views_trigger
    AFTER INSERT OR UPDATE OR DELETE ON request_logs
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_stats_views();
  END IF;
END $$;

-- Create indexes for better performance
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'blocked_ips_view' AND indexdef LIKE '%count DESC%'
  ) THEN
    CREATE INDEX ON blocked_ips_view (count DESC);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'attack_types_view' AND indexdef LIKE '%count DESC%'
  ) THEN
    CREATE INDEX ON attack_types_view (count DESC);
  END IF;
END $$;