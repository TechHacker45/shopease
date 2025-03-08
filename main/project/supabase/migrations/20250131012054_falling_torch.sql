/*
  # Fix unblock_ip function

  1. Changes
    - Drop existing function
    - Create new function with proper parameter naming
    - Grant execute permissions
    - Add proper error handling
*/

-- Drop existing function if exists
DROP FUNCTION IF EXISTS unblock_ip(text);

-- Create the function with proper parameter naming and error handling
CREATE OR REPLACE FUNCTION unblock_ip(target_ip text)
RETURNS void AS $$
BEGIN
  -- Update blocked_ips table
  UPDATE blocked_ips
  SET 
    is_active = false,
    updated_at = now()
  WHERE ip_address = target_ip;

  -- Delete associated botnet nodes
  DELETE FROM botnet_nodes
  WHERE ip_address = target_ip;

  -- Delete botnet detections for this IP
  DELETE FROM botnet_detections
  WHERE source_ip = target_ip;

  -- Delete request logs for this IP
  DELETE FROM request_logs
  WHERE ip = target_ip;

  -- Raise notice for successful execution
  RAISE NOTICE 'Successfully unblocked IP: %', target_ip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users and the anon role
GRANT EXECUTE ON FUNCTION unblock_ip(text) TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_ip(text) TO anon;