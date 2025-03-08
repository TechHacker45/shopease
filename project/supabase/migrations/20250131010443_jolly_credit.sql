/*
  # Add Botnet Detection Tables

  1. New Tables
    - `botnet_detections`
      - Stores botnet detection events with timestamps and source IPs
      - Links to protected sites and request logs
      - Tracks attack patterns and threat levels
    
    - `botnet_nodes`
      - Tracks individual nodes in detected botnets
      - Stores node characteristics and behavior patterns
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for service to insert detection data
*/

-- Botnet Detection Events Table
CREATE TABLE botnet_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  source_ip text NOT NULL,
  target_site_id uuid REFERENCES protected_sites(id) ON DELETE CASCADE,
  request_log_id uuid REFERENCES request_logs(id),
  threat_level text NOT NULL CHECK (threat_level IN ('low', 'medium', 'high')),
  attack_pattern text NOT NULL,
  nodes_count integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Botnet Nodes Table
CREATE TABLE botnet_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id uuid REFERENCES botnet_detections(id) ON DELETE CASCADE,
  ip_address text NOT NULL,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  behavior_pattern jsonb,
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE botnet_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE botnet_nodes ENABLE ROW LEVEL SECURITY;

-- Policies for botnet_detections
CREATE POLICY "Users can read their own botnet detections"
  ON botnet_detections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM protected_sites
      WHERE id = botnet_detections.target_site_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert botnet detections"
  ON botnet_detections
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for botnet_nodes
CREATE POLICY "Users can read nodes for their detections"
  ON botnet_nodes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM botnet_detections bd
      JOIN protected_sites ps ON bd.target_site_id = ps.id
      WHERE bd.id = botnet_nodes.detection_id
      AND ps.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert botnet nodes"
  ON botnet_nodes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamps()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_botnet_detection_timestamps
  BEFORE UPDATE ON botnet_detections
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER update_botnet_node_timestamps
  BEFORE UPDATE ON botnet_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamps();

-- Function to update botnet nodes on detection
CREATE OR REPLACE FUNCTION update_botnet_nodes()
RETURNS trigger AS $$
BEGIN
  -- Update existing node if found
  UPDATE botnet_nodes
  SET 
    last_seen = NEW.timestamp,
    request_count = request_count + 1,
    updated_at = now()
  WHERE ip_address = NEW.source_ip
  AND detection_id = NEW.id;

  -- Insert new node if not exists
  IF NOT FOUND THEN
    INSERT INTO botnet_nodes (
      detection_id,
      ip_address,
      first_seen,
      last_seen,
      behavior_pattern
    ) VALUES (
      NEW.id,
      NEW.source_ip,
      NEW.timestamp,
      NEW.timestamp,
      jsonb_build_object(
        'initial_pattern', NEW.attack_pattern,
        'threat_level', NEW.threat_level
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update nodes on new detection
CREATE TRIGGER update_botnet_nodes_trigger
  AFTER INSERT ON botnet_detections
  FOR EACH ROW
  EXECUTE FUNCTION update_botnet_nodes();

-- Create indexes for better query performance
CREATE INDEX idx_botnet_detections_timestamp ON botnet_detections(timestamp DESC);
CREATE INDEX idx_botnet_detections_source_ip ON botnet_detections(source_ip);
CREATE INDEX idx_botnet_detections_threat_level ON botnet_detections(threat_level);
CREATE INDEX idx_botnet_nodes_ip_address ON botnet_nodes(ip_address);
CREATE INDEX idx_botnet_nodes_last_seen ON botnet_nodes(last_seen DESC);