/*
  # Fix unblock_ip function with proper schema handling

  1. Changes
    - Drop existing function
    - Create new function with proper schema handling
    - Grant execute permissions
    - Add proper error handling
*/

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.unblock_ip(text);

-- Create the function with proper schema handling
CREATE OR REPLACE FUNCTION public.unblock_ip(target_ip text)
RETURNS void AS $$
DECLARE
  affected_rows integer;
BEGIN
  -- Update blocked_ips table and get number of affected rows
  WITH blocked_update AS (
    UPDATE public.blocked_ips
    SET 
      is_active = false,
      updated_at = now()
    WHERE ip_address = target_ip
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_rows FROM blocked_update;

  -- If no rows were updated, raise an exception
  IF affected_rows = 0 THEN
    RAISE EXCEPTION 'IP address % not found or already unblocked', target_ip;
  END IF;

  -- Delete associated data
  DELETE FROM public.botnet_nodes
  WHERE ip_address = target_ip;

  DELETE FROM public.botnet_detections
  WHERE source_ip = target_ip;

  DELETE FROM public.request_logs
  WHERE ip = target_ip;

  -- Raise notice for successful execution
  RAISE NOTICE 'Successfully unblocked IP: %', target_ip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.unblock_ip(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unblock_ip(text) TO anon;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';