# Troubleshooting: Create Class Stuck di "Membuat..."

## ✅ Yang Sudah OK

- ✅ Storage bucket `class-materials` sudah ada (error duplicate key = sudah dibuat)

## 🔍 Langkah Debugging

### 1. Pastikan Column `class_end_time` Ada (WAJIB)

Jalankan di **Supabase Dashboard → SQL Editor**:

```sql
-- Check struktur table classes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'classes'
ORDER BY ordinal_position;
```

**Jika kolom `class_end_time` TIDAK ADA**, jalankan migration:

```sql
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS class_end_time VARCHAR(10);

COMMENT ON COLUMN public.classes.class_end_time IS 'Time when the class ends (HH:MM format)';
```

---

### 2. Check RLS Policies untuk INSERT

Jalankan di **SQL Editor**:

```sql
-- Check policy untuk INSERT di table classes
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
WHERE tablename = 'classes' AND cmd = 'INSERT';
```

**Yang harus ada:**

- Policy untuk admin bisa INSERT
- Policy name: `"Only admins can insert classes"` atau similar

**Jika tidak ada policy atau broken**, jalankan:

```sql
-- Drop old policy
DROP POLICY IF EXISTS "Only admins can insert classes" ON public.classes;

-- Create new policy yang benar
CREATE POLICY "Only admins can insert classes"
ON public.classes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

### 3. Verify User adalah Admin

Jalankan di **SQL Editor** (ganti dengan email Anda):

```sql
-- Check role user
SELECT id, email, role
FROM public.profiles
WHERE email = 's32230111@student.ubm.ac.id';
```

**Harus menunjukkan:**

- `role` = `'admin'`

**Jika bukan admin**, update:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 's32230111@student.ubm.ac.id';
```

---

### 4. Test Create Class dengan Console Logs

1. **Clear browser cache:** Ctrl+Shift+Del
2. **Open browser console:** F12 → Console tab
3. **Buka halaman Create Class:** http://localhost:3000/admin/classes/create
4. **Isi form dengan data minimal:**
   - Judul: Test Class
   - Deskripsi: Test description
   - Durasi: 2
   - Ruangan: Lab 301
   - Max Peserta: 30
   - Tanggal: Pilih tanggal besok
   - Waktu Mulai: 10:00
   - **Waktu Selesai: KOSONGKAN DULU** (field opsional)
   - Batas Pendaftaran: Pilih hari ini jam 23:00
5. **Klik "Buat Kelas"**
6. **Lihat console logs:**

**Logs yang HARUS muncul:**

```
[CreateClass] Starting form submission
[CreateClass] User authenticated: <user-id>
[CreateClass] Preparing to insert class data
[CreateClass] Insert data prepared: {title: "Test Class", ...}
[CreateClass] Class created successfully: [...]
```

**Jika ada ERROR di console:**

- Screenshot error merah lengkap
- Kirim ke saya untuk analysis

---

### 5. Check Network Tab (Jika Console Tidak Ada Error)

1. **F12 → Network tab**
2. **Clear network logs** (ikon 🚫)
3. **Ulangi create class**
4. **Filter by:** "classes" atau "from"
5. **Cari request POST ke /rest/v1/classes**
6. **Klik request → Preview/Response tab**
7. **Check response:**
   - Status Code harus 201 Created
   - Jika 400/500, lihat error message

---

## 🚨 Common Issues & Solutions

### Issue 1: "permission denied for table classes"

**Penyebab:** RLS policy tidak allow INSERT  
**Solusi:** Jalankan ulang step 2 di atas (create policy)

### Issue 2: "null value in column 'class_end_time' violates not-null constraint"

**Penyebab:** Column required tapi form tidak kirim value  
**Solusi:** Field sudah dibuat opsional di code, refresh page

### Issue 3: "column 'class_end_time' does not exist"

**Penyebab:** Migration belum dijalankan  
**Solusi:** Jalankan step 1 di atas (add column)

### Issue 4: Stuck tanpa error di console

**Penyebab:** JavaScript error atau network issue  
**Solusi:**

- Check browser console untuk ANY red errors
- Check Network tab untuk failed requests
- Try hard refresh: Ctrl+Shift+R

---

## 📝 Quick Fix SQL Script

Jalankan semua ini di **Supabase SQL Editor** sekaligus:

```sql
-- 1. Add column if not exists
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS class_end_time VARCHAR(10);

-- 2. Fix RLS policy
DROP POLICY IF EXISTS "Only admins can insert classes" ON public.classes;

CREATE POLICY "Only admins can insert classes"
ON public.classes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Verify your admin status (GANTI EMAIL)
SELECT email, role FROM public.profiles WHERE email = 's32230111@student.ubm.ac.id';

-- If role is not 'admin', run this:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 's32230111@student.ubm.ac.id';
```

---

## 🎯 Next Steps

Setelah menjalankan SQL di atas:

1. ✅ Refresh halaman create class
2. ✅ Isi form (Waktu Selesai boleh kosong)
3. ✅ Open console (F12)
4. ✅ Klik "Buat Kelas"
5. ✅ **Screenshot console logs** dan kirim ke saya

Dengan console logs yang lengkap, saya bisa tahu persis di mana errornya! 🔧
