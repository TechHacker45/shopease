/*
  # Create request logs table for AI-WAF

  1. New Tables
    - `request_logs`
      - `id` (uuid, primary key)
      - `timestamp` (timestamptz)
      - `ip` (text)
      - `threat_score` (float)
      - `is_threat` (boolean)
      - `threat_type` (text)
      - `request_path` (text)
      - `request_method` (text)

  2. Security
    - Enable RLS on `request_logs` table
    - Add policy for authenticated users to read logs
    - Add policy for the service to insert logs
*/

CREATE TABLE request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  ip text NOT NULL,
  threat_score float NOT NULL,
  is_threat boolean NOT NULL,
  threat_type text,
  request_path text NOT NULL,
  request_method text NOT NULL
);

-- Enable RLS
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read logs"
  ON request_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service to insert logs"
  ON request_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);