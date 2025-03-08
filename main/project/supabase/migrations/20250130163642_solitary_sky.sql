/*
  # Security Views Migration

  1. Views
    - Create materialized views for statistics:
      - blocked_ips_view: Shows statistics of blocked IPs
      - attack_types_view: Shows statistics of attack types
    
  2. Security
    - Grant SELECT access to authenticated users
    - Add indexes for better query performance

  Note: Trigger and function creation is skipped as they already exist
  from a previous migration.
*/

-- Drop existing views if they exist
DROP MATERIALIZED VIEW IF EXISTS blocked_ips_view;
DROP MATERIALIZED VIEW IF EXISTS attack_types_view;

-- Create materialized views for better performance
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

-- Create indexes for better performance
CREATE INDEX ON blocked_ips_view (count DESC);
CREATE INDEX ON attack_types_view (count DESC);