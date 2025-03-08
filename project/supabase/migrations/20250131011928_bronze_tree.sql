/*
  # Add unblock_ip stored procedure

  1. New Procedure
    - `unblock_ip(ip_address text)`: Handles all IP unblocking operations in a single transaction
      - Updates blocked_ips table
      - Removes associated request logs
      - Removes botnet detection data
      - Removes botnet nodes data

  2. Changes
    - More efficient than multiple separate deletions
    - Handles all cleanup in a single atomic operation
    - Maintains data consistency
*/

-- Create the stored procedure for unblocking IPs
CREATE OR REPLACE FUNCTION unblock_ip(ip_address text)
RETURNS void AS $$
BEGIN
  -- Start transaction
  -- Update blocked_ips table
  UPDATE blocked_ips
  SET 
    is_active = false,
    updated_at = now()
  WHERE ip_address = $1;

  -- Delete associated botnet nodes
  DELETE FROM botnet_nodes
  WHERE ip_address = $1;

  -- Delete botnet detections for this IP
  DELETE FROM botnet_detections
  WHERE source_ip = $1;

  -- Delete request logs for this IP
  DELETE FROM request_logs
  WHERE ip = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;