/*
  # Set up admin user

  1. Changes
    - Set admin role for admin@shopease.com user
    - Update user metadata to grant admin privileges

  2. Security
    - Only updates specific user
    - Uses secure metadata update
*/

DO $$
BEGIN
  -- Update user metadata to grant admin role
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{is_admin}',
    '"true"'
  )
  WHERE email = 'admin@shopease.com';
END $$;