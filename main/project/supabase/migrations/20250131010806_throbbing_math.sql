/*
  # Fix Blocked IPs RLS Policies

  1. Changes
    - Update RLS policies for blocked_ips table
    - Add policy for service role to insert records
    - Fix user insert policy to handle auth.uid()

  2. Security
    - Maintain RLS protection
    - Allow authenticated users to manage IPs
    - Allow service role to insert records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert blocked IPs" ON blocked_ips;

-- Create new insert policy for authenticated users
CREATE POLICY "Users can insert blocked IPs"
  ON blocked_ips
  FOR INSERT
  TO authenticated
  WITH CHECK (
    CASE
      WHEN blocked_by IS NULL THEN true
      ELSE blocked_by = auth.uid()
    END
  );