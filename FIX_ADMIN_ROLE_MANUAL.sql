-- ============================================================
-- FIX ADMIN ROLE - Update existing profile to admin
-- ============================================================
-- Masalah: Profile sudah dibuat dengan role 'member' 
-- sebelum callback route di-fix untuk check NEXT_PUBLIC_ADMIN_EMAILS

-- Update role ke admin untuk user yang sudah ada
UPDATE profiles 
SET role = 'admin' 
WHERE email = 's32230111@student.ubm.ac.id';

-- Verify hasil update
SELECT id, email, full_name, nim, role, created_at, updated_at
FROM profiles 
WHERE email = 's32230111@student.ubm.ac.id';

-- ============================================================
-- OPTIONAL: Update multiple admin sekaligus
-- ============================================================
-- Uncomment jika ingin update semua admin dari NEXT_PUBLIC_ADMIN_EMAILS

-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email IN (
--   's32230111@student.ubm.ac.id',
--   's32240127@student.ubm.ac.id',
--   's32230123@student.ubm.ac.id',
--   's32230130@student.ubm.ac.id',
--   's32240207@student.ubm.ac.id',
--   's32230099@student.ubm.ac.id'
-- );

-- Verify all admins
-- SELECT id, email, full_name, nim, role 
-- FROM profiles 
-- WHERE role = 'admin'
-- ORDER BY email;
