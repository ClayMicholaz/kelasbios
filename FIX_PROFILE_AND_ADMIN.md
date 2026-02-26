# Panduan Perbaikan Profile & Admin Access

## 🔍 Masalah yang Ditemukan

1. **Profile menampilkan "User"** - Nama tidak terupdate dengan benar
2. **Role dan NIM tidak muncul** - Data profile tidak lengkap
3. **Admin access tidak tersedia** - Role admin belum diset

## ✅ Perbaikan yang Sudah Dilakukan

### 1. **Fix Logic di Codebase**

- ✔️ [auth/callback/page.tsx](../src/app/auth/callback/page.tsx) - Hapus pengecekan admin emails dari env
- ✔️ [dashboard/page.tsx](../src/app/dashboard/page.tsx) - Default role = member
- ✔️ [proxy.ts](../src/lib/supabase/proxy.ts) - Cek role langsung dari database

### 2. **Konsistensi Role Management**

- ❌ DULU: Role diset otomatis berdasarkan `NEXT_PUBLIC_ADMIN_EMAILS`
- ✅ SEKARANG: Semua user baru = `member`, admin diset manual via SQL

## 📋 Langkah-Langkah Perbaikan

### **STEP 1: Jalankan SQL Script di Supabase**

1. Buka **Supabase SQL Editor**:
   - https://app.supabase.com/project/ezcpwobnfntjfrytaorq/sql/new

2. Copy & Paste isi file: [fix_existing_profiles.sql](../supabase/migrations/fix_existing_profiles.sql)

3. Klik **Run** untuk menjalankan script

4. **Verifikasi hasil** dengan query:
   ```sql
   SELECT email, full_name, nim, role
   FROM profiles
   ORDER BY role, email;
   ```

Script ini akan:

- ✅ Extract NIM dari email (8 digit)
- ✅ Set role `admin` untuk 6 email yang ditunjuk
- ✅ Set role `member` untuk semua user lainnya
- ✅ Update `full_name` dari Google OAuth metadata

### **STEP 2: Clear Browser Cache & Logout**

1. **Buka DevTools** (F12)
2. **Application tab** → Clear all storage:
   - Local Storage
   - Session Storage
   - Cookies
3. **Logout** dari aplikasi
4. **Close tab** dan **buka tab baru**

### **STEP 4: Login Ulang**

1. Login kembali dengan Google UBM
2. Profile akan ter-refresh dengan data yang benar
3. Untuk **admin**, menu "Admin" akan muncul di Navbar

## 🎯 Cara Kerja Sekarang

### **User Baru (First Login)**

```
Login → Profile dibuat otomatis → Role = member, NIM extracted
```

### **Set User sebagai Admin**

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'email@student.ubm.ac.id';
```

### **Akses Admin**

- Admin akan melihat menu **"Admin"** di Navbar
- Admin bisa akses `/admin` route
- Member tidak bisa akses (redirect ke 403)

## 🔧 Troubleshooting

### Profile masih menampilkan "User"?

1. Jalankan SQL script fix_existing_profiles.sql
2. Logout dan login kembali
3. Clear browser cache

### Role/NIM masih kosong?

1. Cek di Supabase dengan query:
   ```sql
   SELECT * FROM profiles WHERE email = 'your.email@student.ubm.ac.id';
   ```
2. Jika masih kosong, jalankan SQL script lagi
3. Logout dan login ulang

### Admin access tidak muncul?

1. Pastikan role di database = 'admin'
2. Run query:
   ```sql
   UPDATE profiles SET role = 'admin'
   WHERE email = 'your.email@student.ubm.ac.id';
   ```
3. Logout dan login ulang

## 📊 Verifikasi Database

Gunakan [check_profiles_detailed.sql](../supabase/migrations/check_profiles_detailed.sql) untuk cek status semua profiles:

```sql
-- Show all profiles
SELECT email, full_name, nim, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- Count by role
SELECT role, COUNT(*) FROM profiles GROUP BY role;
```

## 🚀 Testing

1. ✅ User baru bisa register → Profile dibuat dengan nama Google
2. ✅ NIM extracted dari email → Muncul di profile
3. ✅ Admin bisa akses `/admin` → Menu Admin muncul
4. ✅ Member tidak bisa akses `/admin` → Redirect 403
5. ✅ Navbar menampilkan nama, role, dan NIM dengan benar

## 📝 Reminder

- ⚠️ **JANGAN** pakai `NEXT_PUBLIC_ADMIN_EMAILS` lagi
- ✅ **SELALU** set admin role via SQL manual
- ✅ Profile data diambil langsung dari database `profiles`
- ✅ NIM otomatis extracted dari email format: `s[8digit]@student.ubm.ac.id`
