/*
  # Create Cart Items Table

  1. New Tables
    - `cart_items`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, not null, references auth.users)
      - `product_id` (uuid, not null, references products)
      - `quantity` (integer, not null)
  2. Security
    - Enable RLS on `cart_items` table
    - Add policy for authenticated users to manage their own cart
*/

-- Create table if not exists
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users,
  product_id uuid NOT NULL REFERENCES products,
  quantity integer NOT NULL DEFAULT 1,
  CONSTRAINT unique_cart_item UNIQUE (user_id, product_id)
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  -- Check if RLS is already enabled for the table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'cart_items' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Check if the select policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can view their own cart items'
  ) THEN
    CREATE POLICY "Users can view their own cart items"
      ON cart_items
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  -- Check if the insert policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can insert their own cart items'
  ) THEN
    CREATE POLICY "Users can insert their own cart items"
      ON cart_items
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- Check if the update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can update their own cart items'
  ) THEN
    CREATE POLICY "Users can update their own cart items"
      ON cart_items
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- Check if the delete policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can delete their own cart items'
  ) THEN
    CREATE POLICY "Users can delete their own cart items"
      ON cart_items
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;