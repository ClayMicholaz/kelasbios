-- Migration: Create policy_acceptance table
-- Run this in your Supabase SQL Editor

-- Create policy_acceptance table
CREATE TABLE IF NOT EXISTS policy_acceptance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  privacy_policy_accepted BOOLEAN DEFAULT FALSE,
  terms_of_service_accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_policy_acceptance_user_id ON policy_acceptance(user_id);

-- Enable Row Level Security
ALTER TABLE policy_acceptance ENABLE ROW LEVEL SECURITY;

-- Policies for policy_acceptance
CREATE POLICY "Users can view their own policy acceptance" ON policy_acceptance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policy acceptance" ON policy_acceptance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policy acceptance" ON policy_acceptance
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_policy_acceptance_updated_at 
  BEFORE UPDATE ON policy_acceptance
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE policy_acceptance IS 'Stores user acceptance of privacy policy and terms of service';
