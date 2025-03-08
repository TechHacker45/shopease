/*
  # Add Network Metrics Table
  
  1. New Tables
    - network_metrics
      - id (uuid, primary key)
      - timestamp (timestamptz)
      - value (integer)
      - type (text)
      - host (text)
      - created_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE network_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  value integer NOT NULL,
  type text NOT NULL CHECK (type IN ('traffic', 'latency', 'errors')),
  host text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE network_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read metrics"
  ON network_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service to insert metrics"
  ON network_metrics
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_network_metrics_timestamp ON network_metrics(timestamp);
CREATE INDEX idx_network_metrics_type ON network_metrics(type);
CREATE INDEX idx_network_metrics_host ON network_metrics(host);