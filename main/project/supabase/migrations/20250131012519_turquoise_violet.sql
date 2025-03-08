/*
  # Fix materialized views refresh

  1. Changes
    - Add unique indexes to materialized views to support concurrent refresh
    - Drop and recreate materialized views with proper indexes

  2. Details
    - Add unique index on (ip) for blocked_ips_view
    - Add unique index on (threat_type) for attack_types_view
*/

-- Drop existing materialized views
DROP MATERIALIZED VIEW IF EXISTS public.blocked_ips_view;
DROP MATERIALIZED VIEW IF EXISTS public.attack_types_view;

-- Recreate materialized views with unique indexes
CREATE MATERIALIZED VIEW public.blocked_ips_view AS
SELECT 
  ip,
  COUNT(*) as count
FROM request_logs
WHERE is_threat = true
GROUP BY ip;

CREATE UNIQUE INDEX blocked_ips_view_ip_idx ON public.blocked_ips_view (ip);

CREATE MATERIALIZED VIEW public.attack_types_view AS
SELECT 
  threat_type,
  COUNT(*) as count
FROM request_logs
WHERE is_threat = true
  AND threat_type IS NOT NULL
GROUP BY threat_type;

CREATE UNIQUE INDEX attack_types_view_threat_type_idx ON public.attack_types_view (threat_type);

-- Grant access to authenticated users
GRANT SELECT ON blocked_ips_view TO authenticated;
GRANT SELECT ON attack_types_view TO authenticated;

-- Create indexes for better performance
CREATE INDEX ON blocked_ips_view (count DESC);
CREATE INDEX ON attack_types_view (count DESC);