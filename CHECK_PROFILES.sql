-- Check if profiles exist and their data
-- Run this in Supabase SQL Editor

-- 1. Check all profiles
SELECT 
  id,
  email,
  full_name,
  nim,
  role,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC;

-- 2. Check profiles with NULL role or nim
SELECT 
  id,
  email,
  full_name,
  nim,
  role
FROM profiles
WHERE role IS NULL OR nim IS NULL OR role = '';

-- 3. Count profiles by role
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;

-- 4. Check if specific emails are in profiles (admin emails)
SELECT 
  email,
  role,
  nim,
  full_name
FROM profiles
WHERE email IN (
  's32230111@student.ubm.ac.id',
  's32240127@student.ubm.ac.id',
  's32230123@student.ubm.ac.id',
  's32230130@student.ubm.ac.id',
  's32240207@student.ubm.ac.id',
  's32230099@student.ubm.ac.id'
);

-- 5. If profiles missing data, update them manually:
-- (Replace USER_ID and EMAIL with actual values)

-- Update role to admin
-- UPDATE profiles 
-- SET role = 'admin'
-- WHERE email = 's32230111@student.ubm.ac.id';

-- Update NIM (extract from email or set manually)
-- UPDATE profiles 
-- SET nim = '32230111'
-- WHERE email = 's32230111@student.ubm.ac.id';

-- Update full name if missing
-- UPDATE profiles 
-- SET full_name = 'Your Name'
-- WHERE email = 's32230111@student.ubm.ac.id';
