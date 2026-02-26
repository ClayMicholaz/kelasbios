# Analisis Masalah Logika - DaftarBIOS App (public/src)

## 📋 RINGKASAN MASALAH YANG DITEMUKAN

### 🔴 CRITICAL ISSUES

#### 1. **Infinite Recursion di RLS Policies** (SAMA SEPERTI MASALAH SEKARANG)

**Lokasi:** `supabase/migrations/00_initial_setup.sql` (lines 94-103, 151-169)

**Masalah:**

```sql
-- ❌ INI MENYEBABKAN INFINITE RECURSION
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles  -- RECURSION!
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Dampak:** Error `infinite recursion detected in policy for relation "profiles"`

**Solusi:** Gunakan SQL script `fix_infinite_recursion.sql` yang sudah dibuat

---

#### 2. **Hardcoded Supabase Credentials**

**Lokasi:** `public/src/lib/supabase-config.ts` (lines 14-20)

**Masalah:**

```typescript
// ❌ HARDCODED CREDENTIALS (credentials berbeda dari .env)
export function getSupabaseConfig() {
  return {
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://vwyvsqjcnohrxcfsgbfo.supabase.co", // Wrong project!
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGci...", // Wrong key!
  };
}
```

**Dampak:**

- App bisa connect ke Supabase project yang salah
- Security risk (hardcoded credentials)
- Data tidak sync antara .env dan fallback

**Solusi:** Hapus fallback, throw error jika env variables tidak ada

---

#### 3. **Admin Check Inconsistency**

**Lokasi:** `public/src/lib/adminUtils.ts` (lines 14-20)

**Masalah:**

```typescript
// ❌ Admin check dari ENV variable, bukan database
export function isAdminEmail(email: string): boolean {
  const nim = extractNIMFromEmail(email);
  if (!nim) return false;

  const adminNims = getAdminNims(); // Dari NEXT_PUBLIC_ADMIN_NIMS
  return adminNims.includes(nim); // Tidak cek database!
}
```

**Dampak:**

- Admin di database ≠ admin di frontend
- Harus update 2 tempat (env + database) untuk set admin
- Bisa out of sync

**Solusi:** Check role dari database profile, bukan env variable

---

### 🟡 MEDIUM ISSUES

#### 4. **Complex Auth Flow dengan Multiple Delays**

**Lokasi:** `public/src/app/auth/callback/page.tsx` (line 69)

**Masalah:**

```typescript
// ❌ Artificial delay 500ms
const timer = setTimeout(handleAuthCallback, 500);
```

**Lokasi:** `public/src/app/dashboard/page.tsx` (lines 18-28)

**Masalah:**

```typescript
// ❌ Auth timeout 10 detik
const timer = setTimeout(() => {
  if (loading) {
    setAuthTimeout(true);
  }
}, 10000);
```

**Dampak:**

- Slow user experience (menunggu 500ms tanpa alasan)
- Auth bisa timeout terlalu cepat (10s) untuk koneksi lambat
- User bingung kenapa harus menunggu

**Solusi:**

- Hapus artificial delay di callback
- Increase timeout ke 30s atau infinite
- Show progress indicator

---

#### 5. **Commented Out Error Handling**

**Lokasi:** Multiple files (`useAuth.ts`, `callback/page.tsx`)

**Masalah:**

```typescript
// ❌ Error handling di-comment
// const error = urlParams.get("error");
// if (error) {
//   console.error("OAuth error:", error);
//   router.push("/?error=auth_error");
//   return;
// }
```

**Dampak:**

- OAuth errors tidak terhandle
- User tidak tahu kenapa login gagal
- Debugging lebih susah

**Solusi:** Un-comment dan properly handle errors

---

#### 6. **No Loading State Management**

**Lokasi:** `public/src/hooks/useAuth.ts`

**Masalah:**

- Loading state tidak di-manage dengan baik
- Race condition bisa terjadi (multiple auth checks concurrent)
- No retry mechanism for failed auth

**Solusi:**

- Implement proper loading state machine
- Add retry logic dengan exponential backoff
- Handle race conditions

---

### 🟢 MINOR ISSUES

#### 7. **Console Logs Left in Production**

**Lokasi:** Multiple files

**Masalah:**

```typescript
// console.log("Session found for email:", email);
// console.log("Valid UBM email, redirecting to dashboard");
```

**Dampak:**

- Performance overhead (minimal)
- Security risk (leak info ke console)
- Unprofessional

**Solusi:** Remove atau wrap dalam `if (process.env.NODE_ENV === 'development')`

---

#### 8. **Duplicate Auth Checks**

**Lokasi:** `callback/page.tsx`, `useAuth.ts`

**Masalah:**

- Email validation terjadi di banyak tempat
- getUserType() dipanggil berulang kali
- Logic tersebar, susah maintain

**Solusi:** Centralize validation logic

---

## 🔧 REKOMENDASI PERBAIKAN

### PRIORITY 1: Fix Infinite Recursion (CRITICAL)

✅ **Sudah dibuat:** `fix_infinite_recursion.sql`

- Jalankan script ini di Supabase SQL Editor
- Hapus semua policy yang recursive
- Buat policy sederhana tanpa subquery ke profiles

### PRIORITY 2: Remove Hardcoded Credentials

📝 **File:** `public/src/lib/supabase-config.ts`

```typescript
// ✅ FIXED VERSION
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase credentials not configured in environment variables",
    );
  }

  return { url, key };
}
```

### PRIORITY 3: Fix Admin Check Logic

📝 **File:** `public/src/lib/adminUtils.ts`

```typescript
// ✅ FIXED VERSION
import { supabase } from "./supabase";

export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return false;
  return data.role === "admin";
}
```

### PRIORITY 4: Simplify Auth Flow

📝 **File:** `public/src/app/auth/callback/page.tsx`

```typescript
// ✅ FIXED VERSION
useEffect(() => {
  const handleAuthCallback = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error) {
      router.push("/?error=auth_error");
      return;
    }

    if (sessionData.session) {
      router.push("/dashboard"); // Immediate redirect
    } else {
      router.push("/");
    }
  };

  handleAuthCallback(); // No delay!
}, [router]);
```

---

## 📊 PERBEDAAN STRUKTUR DATABASE

### Aplikasi Utama (src/)

- `profiles` table
- `classes` table
- `enrollments` table
- `policy_acceptance` table

### DaftarBIOS (public/src/)

- `profiles` table
- `classes` table
- `enrollments` table
- **`registrations` table** ⚠️ TIDAK ADA DI APLIKASI UTAMA!
- **`form_sessions` table** ⚠️ TIDAK ADA DI APLIKASI UTAMA!

### ⚠️ MASALAH

DaftarBIOS menggunakan table `registrations` untuk recruitment form, tapi ini tidak ada di schema database aplikasi utama. Perlu migration untuk create table ini jika ingin merge kedua aplikasi.

---

## ✅ ACTION ITEMS

1. [ ] **IMMEDIATE:** Run `fix_infinite_recursion.sql` di Supabase
2. [ ] Fix hardcoded credentials di `supabase-config.ts`
3. [ ] Refactor admin check untuk use database role
4. [ ] Remove artificial delays di auth flow
5. [ ] Un-comment error handling
6. [ ] Remove console.logs atau wrap dalam dev check
7. [ ] **DECISION NEEDED:** Merge DaftarBIOS ke aplikasi utama atau pisah?
   - Jika merge: Create migration untuk `registrations` dan `form_sessions` tables
   - Jika pisah: Deploy sebagai aplikasi terpisah dengan database terpisah

---

## 🤔 PERTANYAAN UNTUK USER

1. **Apakah DaftarBIOS akan digabung dengan aplikasi utama (kelasbios)?**
   - Ya → Perlu migration besar untuk sync database schema
   - Tidak → Deploy sebagai aplikasi terpisah

2. **Apakah `registrations` table (recruitment form) masih digunakan?**
   - Ya → Perlu create migration
   - Tidak → Bisa hapus code yang related

3. **Untuk admin operations, prefer pakai:**
   - A) Database role check (recommended, lebih secure)
   - B) Environment variable check (current, less secure)
   - C) Hybrid: both checks

---

## 📁 FILES YANG PERLU DIPERBAIKI

1. ✅ `supabase/migrations/fix_infinite_recursion.sql` - SUDAH DIBUAT
2. ❌ `public/src/lib/supabase-config.ts` - NEEDS FIX
3. ❌ `public/src/lib/adminUtils.ts` - NEEDS REFACTOR
4. ❌ `public/src/app/auth/callback/page.tsx` - NEEDS SIMPLIFICATION
5. ❌ `public/src/hooks/useAuth.ts` - NEEDS CLEANUP
6. ❌ `public/src/app/dashboard/page.tsx` - NEEDS TIMEOUT FIX

---

## 🎯 EXPECTED OUTCOME

Setelah semua fix diterapkan:

- ✅ No more infinite recursion errors
- ✅ Fast auth flow (<2s from OAuth to dashboard)
- ✅ Consistent admin checking (database only)
- ✅ Secure (no hardcoded credentials)
- ✅ Clean code (no commented logs)
- ✅ Better UX (no artificial delays)
