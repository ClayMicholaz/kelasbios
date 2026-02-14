-- Add NIM column to profiles table
-- Run this in Supabase SQL Editor
-- NIM format: 8-digit student identification number (e.g., 32230111)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nim VARCHAR(20);

-- Add index for NIM for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_nim ON profiles(nim);

-- Add comment to document the column
COMMENT ON COLUMN profiles.nim IS 'Nomor Induk Mahasiswa - 8 digit student ID number extracted from email';
