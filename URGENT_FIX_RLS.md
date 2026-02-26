# 🚨 URGENT FIX - Profile & Admin Access

## ❌ Masalah yang Terjadi

Dari console log dan check database:

- ✅ Database: Profile ada, lengkap dengan `full_name`, `nim`, `role`
- ❌ Navbar: Profile tetap `undefined/null`
- ❌ Penyebab: **RLS (Row Level Security) policies** tidak benar

**User tidak bisa read profile sendiri karena RLS policy!**

---

## ✅ Solusi - 2 SQL Scripts

### **Script 1: Fix RLS Policies** (WAJIB JALANKAN DULU)

File: [fix_rls_policies.sql](supabase/migrations/fix_rls_policies.sql)

Memperbaiki:

- ✅ Policy untuk user bisa SELECT profile sendiri
- ✅ Policy untuk user bisa INSERT profile (signup)
- ✅ Policy untuk user bisa UPDATE profile sendiri
- ✅ Policy untuk admin bisa lihat semua profiles
- ✅ Permissions yang benar untuk authenticated users

### **Script 2: Update Profile Data** (JALANKAN KEDUA)

File: [fix_existing_profiles.sql](supabase/migrations/fix_existing_profiles.sql)

Memperbaiki:

- ✅ Extract NIM dari email
- ✅ Update full_name dari Google OAuth
- ✅ Set role admin untuk designated emails
- ✅ Set role member untuk others

---

## 📋 LANGKAH-LANGKAH (URUTAN PENTING!)

### **STEP 1: Fix RLS Policies** 🔥 **JALANKAN DULU!**

1. Buka **Supabase SQL Editor**:

   ```
   https://app.supabase.com/project/ezcpwobnfntjfrytaorq/sql/new
   ```

2. Copy seluruh isi file: **fix_rls_policies.sql**

3. Paste ke SQL Editor

4. Klik **RUN** ▶️

5. Pastikan di output muncul table dengan daftar policies:
   ```
   policyname                                | operation | roles
   ------------------------------------------|-----------|-------------
   Admins can update all profiles            | UPDATE    | authenticated
   Admins can view all profiles              | SELECT    | authenticated
   Service role full access                  | ALL       | service_role
   Users can insert their own profile        | INSERT    | authenticated
   Users can update their own profile        | UPDATE    | authenticated
   Users can view their own profile          | SELECT    | authenticated
   ```

### **STEP 2: Update Profile Data**

1. Masih di **Supabase SQL Editor**

2. Buat **New query** (tab baru)

3. Copy seluruh isi file: **fix_existing_profiles.sql**

4. Paste ke SQL Editor

5. Klik **RUN** ▶️

6. Verify dengan query:
   ```sql
   SELECT email, full_name, nim, role
   FROM profiles
   ORDER BY role, email;
   ```

### **STEP 3: Clear Browser & Logout**

1. Buka aplikasi di http://localhost:3000

2. **Logout** dari aplikasi

3. Tekan **F12** → **Application** tab

4. **Clear storage**:
   - Click "Clear site data" button
   - Atau manual clear: Local Storage, Session Storage, Cookies

5. **Close tab** dan buka **tab baru**

### **STEP 4: Login Ulang & Verify**

1. Buka http://localhost:3000

2. Login dengan Google UBM

3. **Cek Navbar** - seharusnya muncul:

   ```
   ✅ Nama lengkap (dari Google, bukan "User")
   ✅ Email
   ✅ Role: admin atau member
   ✅ NIM: 8 digit
   ```

4. **Untuk admin**: Menu "Admin" akan muncul di Navbar

5. **Test access**:
   - Admin: Bisa akses `/admin` ✅
   - Member: Akses `/admin` → Redirect 403 ✅

---

## 🔍 Debug (Jika Masih Bermasalah)

### Check RLS Status

Jalankan [debug_rls.sql](supabase/migrations/debug_rls.sql) untuk diagnostik:

```sql
-- Check if RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- List all policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'profiles';
```

### Check Profile Data

```sql
-- Your profile
SELECT * FROM profiles WHERE email = 'your.email@student.ubm.ac.id';

-- Test if you can read your own profile
SELECT * FROM profiles WHERE id = auth.uid();
```

**Expected:**

- Query `WHERE id = auth.uid()` harus return 1 row (profile Anda)
- Jika return 0 rows = RLS policy masih salah

### Console Logs

Buka browser console (F12) dan cari:

```
[Navbar] Profile data: {...}  ← Harus ada object, bukan null
[Navbar] Profile role: admin  ← Harus ada role
[Navbar] Profile ID: uuid     ← Harus ada ID
```

Jika masih `undefined` = RLS policy belum berjalan dengan benar

---

## 📝 Summary

### Urutan Wajib:

1. ✅ Run `fix_rls_policies.sql`
2. ✅ Run `fix_existing_profiles.sql`
3. ✅ Logout → Clear cache
4. ✅ Login ulang

### Root Cause:

- **RLS policies tidak benar** → User tidak bisa SELECT profile sendiri
- Policy `auth.uid() = id` tidak aktif atau tidak ada

### After Fix:

- ✅ User bisa read/write profile sendiri
- ✅ Admin bisa read/write semua profiles
- ✅ Navbar menampilkan nama, role, NIM dengan benar
- ✅ Admin access berfungsi

---

## 🚀 Files Created

| File                                                                           | Purpose                          |
| ------------------------------------------------------------------------------ | -------------------------------- |
| [fix_rls_policies.sql](supabase/migrations/fix_rls_policies.sql)               | Fix RLS policies - JALANKAN DULU |
| [fix_existing_profiles.sql](supabase/migrations/fix_existing_profiles.sql)     | Update profile data              |
| [debug_rls.sql](supabase/migrations/debug_rls.sql)                             | Diagnostic queries               |
| [check_profiles_detailed.sql](supabase/migrations/check_profiles_detailed.sql) | Profile status check             |

---

**Masalah utama sudah diidentifikasi: RLS POLICIES!**

Jalankan `fix_rls_policies.sql` terlebih dahulu, baru kemudian yang lainnya. 🔥
