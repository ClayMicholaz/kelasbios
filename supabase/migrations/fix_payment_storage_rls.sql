-- Fix Payment Proofs Storage RLS Policy
-- This migration ensures the payment-proofs bucket exists and has proper policies

-- Create storage bucket for payment proofs if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs', 
  'payment-proofs', 
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;

-- Policy: Users can upload payment proofs to their own folder
CREATE POLICY "Users can upload their own payment proofs" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own payment proofs
CREATE POLICY "Users can view their own payment proofs" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Admins can view all payment proofs
CREATE POLICY "Admins can view all payment proofs" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'payment-proofs' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy: Users can update their own payment proofs (for reupload)
CREATE POLICY "Users can update their own payment proofs" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own payment proofs (for cleanup)
CREATE POLICY "Users can delete their own payment proofs" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure enrollments table has proper RLS for payment_proof updates
DROP POLICY IF EXISTS "Users can update their own enrollments" ON enrollments;

CREATE POLICY "Users can update their own enrollments" 
ON enrollments
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
