-- Make class-materials bucket public
-- This allows files to be accessed via /storage/v1/object/public/class-materials/... URLs

UPDATE storage.buckets
SET public = true
WHERE id = 'class-materials';

-- Verify the bucket is now public
SELECT id, name, public FROM storage.buckets WHERE id = 'class-materials';
