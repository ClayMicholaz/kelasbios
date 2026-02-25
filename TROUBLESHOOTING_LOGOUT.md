# 🐛 Troubleshooting: Tombol Logout Tidak Bekerja

## ✅ Perbaikan yang Sudah Dilakukan

### 1. Simplified Logout Logic

- Hapus `router.push()` dan `router.refresh()` yang bisa conflict
- Langsung gunakan `window.location.href` untuk redirect yang lebih reliable
- Tambah error handling yang lebih baik

### 2. Tambah Logging untuk Debugging

Console akan menampilkan log di setiap step:

```
[Navbar] Logout button clicked
[Navbar] Clearing localStorage...
[Navbar] Signing out from Supabase...
[Navbar] SignOut successful, clearing state...
[Navbar] Redirecting to login...
```

### 3. Fix Tailwind CSS Deprecated Classes

- `bg-gradient-to-r` → `bg-linear-to-r`
- `bg-gradient-to-br` → `bg-linear-to-br`

---

## 🧪 Cara Test Logout

### Test di Browser:

1. **Login ke aplikasi:**
   - Buka: `http://localhost:3000/auth/login`
   - Login dengan akun @student.ubm.ac.id

2. **Buka Browser Console:**
   - Tekan `F12` atau `Ctrl+Shift+I`
   - Klik tab **Console**

3. **Klik tombol Logout:**
   - Klik foto profile di pojok kanan atas
   - Klik **"🚪 Keluar"**

4. **Check Console Logs:**
   - Lihat apakah ada log `[Navbar] Logout button clicked`
   - Ikuti step-by-step logs
   - Jika ada error, akan muncul di console

5. **Verify Redirect:**
   - Seharusnya otomatis redirect ke `/auth/login`
   - Cek Navbar - tombol "Masuk dengan Google UBM" harus muncul

---

## ❌ Kemungkinan Masalah dan Solusi

### Masalah 1: Tombol Tidak Diklik / Tidak Ada Respon

**Symptoms:**

- Klik tombol tapi tidak ada yang terjadi
- Tidak ada log di console

**Penyebab:**

- Dropdown tidak tertutup dengan benar
- onClick handler tidak terpanggil
- JavaScript error lain yang block execution

**Solusi:**

```bash
# Clear browser cache
1. Tekan Ctrl+Shift+Delete
2. Clear "Cached images and files"
3. Refresh halaman (Ctrl+R atau F5)

# Hard refresh
Tekan Ctrl+Shift+R (Chrome/Edge)
Atau Cmd+Shift+R (Mac)
```

### Masalah 2: Error di Console

**Symptoms:**

- Log muncul tapi error: "Error signing out" atau sejenisnya

**Penyebab:**

- Supabase client issue
- Network error
- Invalid session

**Solusi:**

```javascript
// Di browser console, coba manual logout:
const { createClient } = await import("./src/lib/supabase/client");
const supabase = createClient();
await supabase.auth.signOut();
window.location.href = "/";
```

### Masalah 3: Logout Tapi Masih Keliatan Login

**Symptoms:**

- Redirect berhasil tapi di `/auth/login` masih show profile
- Atau auto-login lagi

**Penyebab:**

- Session cookies tidak ter-clear
- Browser cache
- Middleware auto-restore session

**Solusi:**

```bash
# Clear ALL browser data:
1. Buka Chrome/Edge Settings
2. Privacy and Security → Clear browsing data
3. Select:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
   - ✅ Site settings
4. Time range: "All time"
5. Clear data
6. Restart browser
7. Test logout lagi
```

### Masalah 4: Redirect Loop

**Symptoms:**

- Setelah logout, redirect bolak-balik
- Loading terus menerus

**Penyebab:**

- Middleware interference
- Multiple redirects

**Solusi:**

1. Check `src/middleware.ts` atau `src/lib/supabase/proxy.ts`
2. Pastikan `/auth/login` tidak di-protect
3. Pastikan logout page (`/auth/logout`) accessible tanpa auth

---

## 🔍 Debug Manual di Browser Console

Jika logout masih tidak bekerja, test manual:

```javascript
// 1. Check current user
const supabase =
  window.supabase ||
  (
    await import("/@fs/D:/Sekolah/UBM/BIOS/kelasbios/src/lib/supabase/client.ts")
  ).createClient();
const { data } = await supabase.auth.getSession();
console.log("Current user:", data.session?.user);

// 2. Manual logout
await supabase.auth.signOut();
console.log("Signed out");

// 3. Check if cleared
const { data: newData } = await supabase.auth.getSession();
console.log("After signout:", newData.session); // Should be null

// 4. Clear localStorage
localStorage.removeItem("policy_accepted");
localStorage.removeItem("policy_checked_at");
console.log("LocalStorage cleared");

// 5. Redirect
window.location.href = "/auth/login";
```

---

## ✅ Verifikasi Logout Berhasil

Setelah logout, verifikasi:

1. **URL berubah ke `/auth/login`** ✅
2. **Navbar menampilkan tombol "Masuk dengan Google UBM"** ✅
3. **Console log menunjukkan semua step berhasil** ✅
4. **Tidak ada error di console** ✅
5. **Coba akses `/dashboard` → redirect ke login** ✅

---

## 🚀 Test di Production (Vercel)

Jika di localhost berhasil tapi di Vercel gagal:

1. **Re-deploy:**

   ```bash
   git add .
   git commit -m "Fix logout functionality"
   git push
   ```

2. **Clear Vercel Cache:**
   - Buka Vercel Dashboard
   - Pilih project → Deployments
   - Klik "..." di deployment terakhir
   - Pilih "Redeploy"

3. **Check Vercel Logs:**
   - Buka Vercel Dashboard
   - Functions → View logs
   - Cari error terkait auth/logout

---

## 📞 Masih Bermasalah?

Jika setelah semua cara di atas logout masih tidak bekerja:

1. **Screenshot console logs** (saat klik logout)
2. **Screenshot Network tab** (untuk lihat API calls)
3. **Copy exact error message**
4. Share untuk troubleshooting lebih lanjut

---

## 🔧 File yang Sudah Diperbaiki

- ✅ `src/components/Navbar.tsx` - Logout handler dengan logging
- ✅ `src/app/auth/logout/page.tsx` - Simplified logout page
- ✅ Fixed deprecated Tailwind classes

Semua changes sudah di-apply. Test sekarang dengan:

```bash
npm run dev
```

Kemudian buka browser: `http://localhost:3000`
