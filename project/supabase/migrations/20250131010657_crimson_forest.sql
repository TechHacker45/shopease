/*
  # Add Blocked IPs Table and Functions

  1. New Tables
    - `blocked_ips`
      - Stores blocked IP addresses
      - Tracks blocking reason and timestamp
      - Links to user who blocked the IP
      - Maintains blocking status

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Blocked IPs Table
CREATE TABLE blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text,
  blocked_by uuid REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true,
  block_count integer NOT NULL DEFAULT 1,
  first_blocked_at timestamptz NOT NULL DEFAULT now(),
  last_blocked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

-- Policies for blocked_ips
CREATE POLICY "Users can read blocked IPs"
  ON blocked_ips
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert blocked IPs"
  ON blocked_ips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocked_by);

CREATE POLICY "Users can update their blocked IPs"
  ON blocked_ips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = blocked_by);

-- Function to update blocked IP timestamps
CREATE OR REPLACE FUNCTION update_blocked_ip()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_blocked_at = now();
  NEW.block_count = OLD.block_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating blocked IP timestamps
CREATE TRIGGER update_blocked_ip_trigger
  BEFORE UPDATE ON blocked_ips
  FOR EACH ROW
  EXECUTE FUNCTION update_blocked_ip();

-- Create indexes for better performance
CREATE INDEX idx_blocked_ips_address ON blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_active ON blocked_ips(is_active);
CREATE INDEX idx_blocked_ips_blocked_by ON blocked_ips(blocked_by);