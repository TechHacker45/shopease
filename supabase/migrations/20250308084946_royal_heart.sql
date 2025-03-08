/*
  # Create Cart Items Table

  1. New Tables
    - `cart_items`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer, not null, default 1)
  2. Constraints
    - Unique constraint on user_id and product_id combination
  3. Security
    - Enable RLS on `cart_items` table
    - Add policies for authenticated users to manage their own cart items
*/

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users,
  product_id uuid NOT NULL REFERENCES products,
  quantity integer NOT NULL DEFAULT 1,
  CONSTRAINT unique_cart_item UNIQUE (user_id, product_id)
);

-- Enable RLS on cart_items table with a safe check
DO $$ 
BEGIN
  -- Check if RLS is already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'cart_items' AND rowsecurity = true
  ) THEN
    ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies with safe checks to avoid duplicates
DO $$ 
BEGIN
  -- Create select policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' AND policyname = 'Users can view their own cart items'
  ) THEN
    CREATE POLICY "Users can view their own cart items"
      ON cart_items
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Create insert policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' AND policyname = 'Users can insert their own cart items'
  ) THEN
    CREATE POLICY "Users can insert their own cart items"
      ON cart_items
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Create update policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' AND policyname = 'Users can update their own cart items'
  ) THEN
    CREATE POLICY "Users can update their own cart items"
      ON cart_items
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Create delete policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' AND policyname = 'Users can delete their own cart items'
  ) THEN
    CREATE POLICY "Users can delete their own cart items"
      ON cart_items
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;