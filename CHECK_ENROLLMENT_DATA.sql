-- Script untuk memeriksa data enrollment yang verified
-- Jalankan di Supabase SQL Editor untuk debug

-- 1. Lihat semua kelas yang open
SELECT 
    id,
    title,
    max_participants,
    status
FROM classes
WHERE status = 'open'
ORDER BY class_date;

-- 2. Lihat semua enrollment yang verified
SELECT 
    e.id,
    e.class_id,
    e.payment_status,
    e.created_at,
    c.title as class_title,
    p.full_name,
    p.email
FROM enrollments e
JOIN classes c ON e.class_id = c.id
JOIN profiles p ON e.user_id = p.id
WHERE e.payment_status = 'verified'
ORDER BY e.created_at DESC;

-- 3. Count verified enrollments per class (FIXED)
SELECT 
    c.id,
    c.title,
    c.max_participants,
    COUNT(CASE WHEN e.payment_status = 'verified' THEN 1 END) as verified_count,
    c.max_participants - COUNT(CASE WHEN e.payment_status = 'verified' THEN 1 END) as available_seats
FROM classes c
LEFT JOIN enrollments e ON e.class_id = c.id
WHERE c.status = 'open'
GROUP BY c.id, c.title, c.max_participants
ORDER BY c.class_date;

-- 4. Lihat semua status enrollment untuk class tertentu (OPTIONAL)
-- Jika ingin lihat detail untuk satu kelas, uncomment dan ganti UUID di bawah
-- Ambil UUID dari hasil query #1 atau #3
/*
SELECT 
    e.payment_status,
    COUNT(*) as count
FROM enrollments e
WHERE e.class_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  -- Ganti dengan UUID yang sebenarnya
GROUP BY e.payment_status;
*/

-- 5. Lihat ringkasan lengkap semua enrollment per kelas
SELECT 
    c.title,
    c.max_participants,
    COUNT(CASE WHEN e.payment_status = 'verified' THEN 1 END) as verified,
    COUNT(CASE WHEN e.payment_status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN e.payment_status = 'rejected' THEN 1 END) as rejected,
    COUNT(e.id) as total_enrollments
FROM classes c
LEFT JOIN enrollments e ON e.class_id = c.id
WHERE c.status = 'open'
GROUP BY c.id, c.title, c.max_participants
ORDER BY c.class_date;
