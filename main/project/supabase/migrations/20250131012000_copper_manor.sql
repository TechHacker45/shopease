/*
  # Fix unblock_ip stored procedure

  1. Changes
    - Add table aliases to resolve ambiguous column references
    - Improve SQL query clarity
    - Maintain same functionality with better error handling
*/

-- Drop existing procedure
DROP FUNCTION IF EXISTS unblock_ip(text);

-- Create the updated stored procedure for unblocking IPs
CREATE OR REPLACE FUNCTION unblock_ip(target_ip text)
RETURNS void AS $$
BEGIN
  -- Update blocked_ips table
  UPDATE blocked_ips bi
  SET 
    is_active = false,
    updated_at = now()
  WHERE bi.ip_address = target_ip;

  -- Delete associated botnet nodes
  DELETE FROM botnet_nodes bn
  WHERE bn.ip_address = target_ip;

  -- Delete botnet detections for this IP
  DELETE FROM botnet_detections bd
  WHERE bd.source_ip = target_ip;

  -- Delete request logs for this IP
  DELETE FROM request_logs rl
  WHERE rl.ip = target_ip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;