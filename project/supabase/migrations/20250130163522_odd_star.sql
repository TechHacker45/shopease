/*
  # Create statistics views
  
  1. New Views
    - `blocked_ips_view`: Aggregates blocked IP addresses and their counts
    - `attack_types_view`: Aggregates attack types and their counts
  
  2. Security
    - Add RLS policies for authenticated users to access the views
*/

-- Create materialized views instead of regular views for better performance
CREATE MATERIALIZED VIEW blocked_ips_view AS
SELECT 
  ip,
  COUNT(*) as count
FROM request_logs
WHERE is_threat = true
GROUP BY ip;

CREATE MATERIALIZED VIEW attack_types_view AS
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
CREATE TRIGGER refresh_stats_views_trigger
AFTER INSERT OR UPDATE OR DELETE ON request_logs
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_stats_views();

-- Create indexes for better performance
CREATE INDEX ON blocked_ips_view (count DESC);
CREATE INDEX ON attack_types_view (count DESC);