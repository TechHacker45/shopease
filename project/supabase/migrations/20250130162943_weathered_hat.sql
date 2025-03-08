/*
  # Create Protected Sites Schema

  1. New Tables
    - `protected_sites`
      - `id` (uuid, primary key)
      - `url` (text, unique)
      - `description` (text, nullable)
      - `is_protected` (boolean)
      - `status` (text)
      - `created_at` (timestamptz)
      - `last_checked` (timestamptz)
      - `user_id` (uuid, foreign key to auth.users)

    - `site_metrics`
      - `id` (uuid, primary key)
      - `site_id` (uuid, foreign key to protected_sites)
      - `total_requests` (bigint)
      - `blocked_requests` (bigint)
      - `last_attack_attempt` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Protected Sites Table
CREATE TABLE protected_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  description text,
  is_protected boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_checked timestamptz,
  user_id uuid REFERENCES auth.users(id)
);

-- Site Metrics Table
CREATE TABLE site_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES protected_sites(id) ON DELETE CASCADE,
  total_requests bigint NOT NULL DEFAULT 0,
  blocked_requests bigint NOT NULL DEFAULT 0,
  last_attack_attempt timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE protected_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for protected_sites
CREATE POLICY "Users can read their own protected sites"
  ON protected_sites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own protected sites"
  ON protected_sites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own protected sites"
  ON protected_sites
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own protected sites"
  ON protected_sites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for site_metrics
CREATE POLICY "Users can read metrics for their sites"
  ON site_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM protected_sites
      WHERE id = site_metrics.site_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service can update metrics"
  ON site_metrics
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Function to update site metrics
CREATE OR REPLACE FUNCTION update_site_metrics()
RETURNS trigger AS $$
BEGIN
  UPDATE site_metrics
  SET 
    total_requests = total_requests + 1,
    blocked_requests = CASE 
      WHEN NEW.is_threat THEN blocked_requests + 1 
      ELSE blocked_requests 
    END,
    last_attack_attempt = CASE 
      WHEN NEW.is_threat THEN NEW.timestamp 
      ELSE last_attack_attempt 
    END,
    updated_at = now()
  WHERE site_id = (
    SELECT id FROM protected_sites
    WHERE url LIKE '%' || split_part(NEW.request_path, '/', 3) || '%'
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics on new request logs
CREATE TRIGGER update_site_metrics_trigger
AFTER INSERT ON request_logs
FOR EACH ROW
EXECUTE FUNCTION update_site_metrics();