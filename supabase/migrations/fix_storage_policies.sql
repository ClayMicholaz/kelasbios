-- Fix Storage Policies untuk class-materials bucket
-- Masalah: Admin tidak bisa upload karena RLS policy
-- PENTING: Bucket name di code adalah 'class-materials' (dengan DASH)

-- Drop semua existing policies untuk clean slate
DROP POLICY IF EXISTS "Admins can upload class materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update class materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete class materials" ON storage.objects;
DROP POLICY IF EXISTS "Enrolled users can view class materials" ON storage.objects;

-- Policy 1: Admin dapat INSERT (upload) class materials
CREATE POLICY "Admins can upload class materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'class-materials' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 2: Admin dapat UPDATE class materials
CREATE POLICY "Admins can update class materials"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'class-materials' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'class-materials' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Admin dapat DELETE class materials
CREATE POLICY "Admins can delete class materials"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'class-materials' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 4: Enrolled users (verified payment) dapat SELECT (view) class materials
CREATE POLICY "Enrolled users can view class materials"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'class-materials' AND
  (
    -- Admin dapat view semua
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- User yang enrolled dan payment verified dapat view
    EXISTS (
      SELECT 1 FROM public.enrollments e
      INNER JOIN public.classes c ON e.class_id = c.id
      WHERE e.user_id = auth.uid()
        AND e.payment_status = 'verified'
        AND (storage.foldername(name))[1] = c.id::text
    )
  )
);

-- Verify policies dibuat
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%class_materials%'
ORDER BY policyname;
