# Troubleshooting Guide - Updated

## Quick Reference

### 🚪 Logout Button Location

**Logout button ada di dropdown profile**:

1. Klik **photo profile** di pojok kanan atas navbar
2. Dropdown akan muncul dengan menu:
   - ⚙️ Dashboard Admin (jika role = admin)
   - 👤 Dashboard Member (jika role = admin)
   - 📊 Dashboard Saya (jika role = member)
   - 🚪 **Keluar** ← ini logout button

### ⚙️ Dashboard Admin Access

**Admin bisa akses dashboard admin dari 2 tempat**:

1. **Navbar** → Klik tombol "Admin" (muncul otomatis jika role = admin)
2. **Dropdown profile** → Klik "⚙️ Dashboard Admin"

---

## Recent Fixes Applied

### ✅ 1. Auth Timeout Fixed

**Problem:** `auth.getUser()` hanging/timeout 10 detik
**Solution:** Ganti semua `auth.getUser()` → `auth.getSession()` di:

- `/admin/classes/create/page.tsx`
- `PolicyCard.tsx`
- `PolicyModal.tsx`
- `auth/callback/page.tsx`

**Result:** Login sekarang instant, tidak stuck di "Memproses Autentikasi"

### ✅ 2. Dashboard Button Color Fixed

**Problem:** Tombol "Jelajahi Kelas" di dashboard warnanya ungu (indigo)
**Solution:** Ganti `bg-indigo-600` → `bg-primary-600`
**Location:** `src/app/dashboard/page.tsx` line 438

### ✅ 3. Profile Photo Issues

**Added:**

- `unoptimized` prop untuk Next.js Image (bypass optimization untuk Google avatar)
- Console logging untuk debug avatar URL
- Proper fallback ke initial jika avatar tidak ada

**Photo Profile Logic:**

- Jika `user.user_metadata.avatar_url` ada → tampilkan foto Google
- Jika tidak ada → tampilkan initial (huruf pertama nama/email) dengan gradient background
- Jika belum login → tampilkan button "Masuk dengan Google UBM"

---

## 1. PolicyCard Tidak Muncul

**Kemungkinan Penyebab:**

- Table `policy_acceptance` belum ada di Supabase
- User sudah pernah accept (check di database)
- Loading forever (check console log)

**Cara Fix:**

### Cek 1: Pastikan Table Ada

Buka **Supabase Dashboard** → SQL Editor, jalankan:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'policy_acceptance'
);
```

Jika hasil `false`, run migration:

```sql
-- Copy paste dari: supabase/migrations/create_policy_acceptance.sql
-- Atau jalankan file tersebut di SQL Editor
```

### Cek 2: Check Console Log

1. Refresh halaman (dashboard atau home)
2. Buka Console (F12)
3. Lihat log `[PolicyCard]`:
   - Apakah muncul `[PolicyCard] Component mounted`?
   - Apakah muncul `[PolicyCard] User has NOT accepted, showing card`?
   - Jika stuck, lihat di log mana berhenti

### Cek 3: Check User Acceptance Status

```sql
-- Lihat apakah user sudah accept
SELECT * FROM policy_acceptance
WHERE user_id = (SELECT id FROM auth.users WHERE email = 's32230111@student.ubm.ac.id');

-- Jika ada data dan sudah accepted, card memang tidak akan muncul
-- Untuk test, hapus data:
DELETE FROM policy_acceptance
WHERE user_id = (SELECT id FROM auth.users WHERE email = 's32230111@student.ubm.ac.id');
```

---

## 2. Photo Profile Tidak Muncul

**Kemungkinan Penyebab:**

- Google OAuth tidak return `avatar_url`
- Image component error
- Profile data tidak terload

**Cara Fix:**

### Cek 1: Check Console Log

Lihat log `[Navbar]`:

```
[Navbar] Profile data: { ... }
[Navbar] Auth change - Profile data: { ... }
```

### Cek 2: Check User Metadata

Di Console, ketik:

```javascript
// Check user metadata
const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("User metadata:", user.user_metadata);
console.log("Avatar URL:", user.user_metadata?.avatar_url);
```

### Cek 3: Fallback Sedang Aktif

Jika avatar_url tidak ada, seharusnya menampilkan **inisial dengan background gradient**.
Contoh: huruf "S" untuk "s32230111@student.ubm.ac.id"

**Pastikan tidak ada error di Console terkait Image component dari Next.js**

---

## 3. Create Class Stuck

**Status:** Fixed dengan timeout mechanism

**Yang Sudah Ditambahkan:**

- ✅ Timeout 10 detik untuk `auth.getUser()`
- ✅ Console log lengkap di setiap step
- ✅ Error handling untuk hanging promise

**Cara Test:**

1. Refresh halaman `/admin/classes/create`
2. Isi form create class
3. Submit form
4. Perhatikan console log:

**Expected Logs (Success):**

```
[CreateClass] Starting form submission
[CreateClass] Form data: {...}
[CreateClass] About to enter try block...
[CreateClass] Inside try block
[CreateClass] Creating supabase client...
[CreateClass] Supabase client created successfully
[CreateClass] Getting authenticated user...
[CreateClass] ✓ Auth call completed
[CreateClass] Auth result: {...}
[CreateClass] User authenticated: ...
...
```

**Expected Logs (Error/Timeout):**

```
[CreateClass] Getting authenticated user...
[CreateClass] ✗ Auth call threw error: Error: Auth timeout after 10s
[CreateClass] =================================
[CreateClass] ERROR CAUGHT IN MAIN HANDLER
...
```

**Jika Timeout Terjadi:**
Masalah ada di koneksi ke Supabase atau RLS policy. Check:

```sql
-- Verify Supabase connection
SELECT current_user, current_database();

-- Check if user can access classes table
SELECT * FROM classes LIMIT 1;
```

---

## Quick Test Script

Jalankan di Browser Console untuk test semua sekaligus:

```javascript
(async () => {
  console.log("=== TESTING ALL COMPONENTS ===");

  // Test 1: Supabase Connection
  console.log("\\n1. Testing Supabase connection...");
  const { createClient } = await import("./src/lib/supabase/client.ts");
  const supabase = createClient();

  // Test 2: Auth
  console.log("\\n2. Testing auth...");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  console.log("User:", user?.email);
  console.log("Auth error:", authError);

  // Test 3: Profile
  console.log("\\n3. Testing profile...");
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    console.log("Profile:", profile);
    console.log("Avatar URL:", user.user_metadata?.avatar_url);
  }

  // Test 4: Policy Acceptance Table
  console.log("\\n4. Testing policy_acceptance table...");
  const { data: policyData, error: policyError } = await supabase
    .from("policy_acceptance")
    .select("*")
    .eq("user_id", user.id)
    .single();
  console.log("Policy data:", policyData);
  console.log("Policy error:", policyError);

  console.log("\\n=== TEST COMPLETE ===");
})();
```

---

## Next Steps

1. **Refresh halaman** dan lihat Console logs
2. **Check logs** untuk `[PolicyCard]` dan `[Navbar]`
3. **Test create class** dengan form submission
4. **Kirim screenshot** console logs jika masih ada masalah

**Jika masih stuck, run SQL queries di Supabase SQL Editor untuk verify table dan data.**
