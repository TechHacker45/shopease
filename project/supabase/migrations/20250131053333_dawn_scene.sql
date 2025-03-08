/*
  # Fix network metrics policies

  1. Changes
    - Update RLS policies for network_metrics table
    - Add policies for both authenticated and anonymous access
    - Enable proper metric insertions
  
  2. Security
    - Maintain read access for authenticated users
    - Allow metric insertions from both authenticated and anonymous users
    - Ensure proper access control while allowing monitoring functionality
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read metrics" ON network_metrics;
DROP POLICY IF EXISTS "Allow service to insert metrics" ON network_metrics;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON network_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for anonymous users"
  ON network_metrics
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON network_metrics
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';