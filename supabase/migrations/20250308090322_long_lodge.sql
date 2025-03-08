/*
  # Add admin role and policies

  1. New Policies
    - Allow admins to manage products
    - Restrict product management to admin users only

  2. Security
    - Create admin role check function
    - Update product policies to allow admin access
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_admin' = 'true'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update products policies to allow admin access
CREATE POLICY "Allow admins to manage products"
ON products
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());