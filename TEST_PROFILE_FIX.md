# 🔧 FIX FINAL: Profile Tidak Terdeteksi & Logout Tidak Bekerja

## ✅ Perbaikan yang Sudah Dilakukan

### 1. **Tambah Force Refresh Profile Button**

Klik foto profile → Ada button "🔄 Refresh Profile" untuk force fetch data terbaru dari database.

### 2. **Perbaiki Logout - Clear SEMUA Storage**

Logout sekarang akan clear:

- ✅ localStorage (semua keys)
- ✅ sessionStorage (semua keys)
- ✅ All cookies
- ✅ Supabase auth session (global scope)
- ✅ Component state
- ✅ Force complete page reload dengan `window.location.replace()`

### 3. **Server Sudah Restart**

Development server sudah restart dengan `.env` yang baru.

---

## 🚀 CARA TEST SEKARANG:

### STEP 1: Clear Browser Data (PENTING!)

**Opsi A - Quick Clear (Recommended):**

```
1. Buka Incognito/Private Window
   - Chrome: Ctrl+Shift+N
   - Edge: Ctrl+Shift+P
   - Firefox: Ctrl+Shift+P

2. Buka: http://localhost:3000
3. Login dengan akun admin Anda
```

**Opsi B - Complete Clear:**

```
1. Tekan Ctrl+Shift+Delete
2. Pilih:
   ✅ Cookies and other site data
   ✅ Cached images and files
   ✅ Site settings
3. Time range: "All time"
4. Click "Clear data"
5. Restart browser
```

### STEP 2: Login

1. Buka `http://localhost:3000/auth/login`
2. Login dengan: `s32230111@student.ubm.ac.id`
3. **Buka Console (F12)** dan perhatikan logs

### STEP 3: Check Profile

Klik foto profile di pojok kanan atas, seharusnya muncul:

```
✅ KWIK ANDREAS JONATHAN
✅ s32230111@student.ubm.ac.id
✅ Badge: Admin
✅ Role: admin | NIM: 32230111
✅ Button: 🔄 Refresh Profile
```

### STEP 4: Jika Masih "not set"

**Klik button "🔄 Refresh Profile"** - ini akan force fetch dari database.

Console akan show:

```
[Navbar] Force refreshing profile...
[Navbar] Force refresh - New profile data: { role: "admin", nim: "32230111", ... }
```

Setelah refresh, data harus muncul.

### STEP 5: Test Logout

1. Klik foto profile → **"🚪 Keluar"**
2. Console akan show:
   ```
   [Navbar] Logout button clicked
   [Navbar] Clearing ALL storage...
   [Navbar] Signing out from Supabase...
   [Navbar] Clearing state...
   [Navbar] Redirecting to login...
   ```
3. Halaman akan completely reload ke `/auth/login`
4. Verify navbar show button "Masuk dengan Google UBM"

---

## 🐛 Troubleshooting

### Masalah: Profile Masih "not set" Setelah Login

**Coba ini step-by-step:**

1. **Manual Check di Console (F12):**

   ```javascript
   // Paste ini di console
   const { createClient } = await import("/src/lib/supabase/client.ts");
   const supabase = createClient();
   const { data } = await supabase.auth.getSession();
   console.log("User ID:", data.session?.user?.id);

   // Lalu fetch profile
   const { data: profile } = await supabase
     .from("profiles")
     .select("*")
     .eq("id", data.session?.user?.id)
     .single();
   console.log("Profile from DB:", profile);
   ```

   **Expected Output:**

   ```javascript
   Profile from DB: {
     id: "...",
     email: "s32230111@student.ubm.ac.id",
     full_name: "KWIK ANDREAS JONATHAN",
     nim: "32230111",
     role: "admin",
     ...
   }
   ```

2. **Force Refresh dengan Button:**
   - Klik foto profile
   - Klik "🔄 Refresh Profile"
   - Tunggu sampai button berubah dari "Refreshing..." ke "🔄 Refresh Profile"
   - Check lagi

3. **Hard Reload Page:**
   - Tekan `Ctrl+Shift+R` (hard reload)
   - Login lagi
   - Check profile

4. **Clear Everything dan Restart:**
   ```
   1. Logout (kalau bisa)
   2. Close browser completely
   3. Clear browser data (Ctrl+Shift+Delete → All time)
   4. Restart browser
   5. Open Incognito window
   6. Login lagi
   ```

### Masalah: Logout Tidak Bekerja / Stuck

**NEW: Logout sekarang menggunakan `window.location.replace()` yang lebih force.**

Jika masih stuck:

1. **Manual Logout di Console:**

   ```javascript
   // Paste di console
   localStorage.clear();
   sessionStorage.clear();
   window.location.replace("/auth/login");
   ```

2. **Force Close Tab:**
   - Close tab browser
   - Open new tab
   - Go to: `http://localhost:3000`
   - Harus redirect ke login (kalau sudah logout)

### Masalah: Menu Admin Tidak Muncul

Setelah profile refresh dan role sudah "admin", tapi menu admin tidak muncul:

1. **Reload page sekali lagi** (Ctrl+R)
2. **Check console logs:**
   ```
   [Navbar] Profile role: admin
   [Navbar] Is admin check: true
   ```
3. **Verify di dropdown:**
   - Harus ada badge "Admin"
   - Harus ada menu "⚙️ Dashboard Admin"

---

## 🔍 Debug Checklist

Pastikan semuanya ✅:

**Environment:**

- [ ] `.env` file format benar (no spaces after commas)
- [ ] Server sudah restart (`npm run dev`)
- [ ] No error di terminal

**Database:**

- [ ] Profile exists di Supabase
- [ ] `role = "admin"` (bukan null)
- [ ] `nim = "32230111"` (bukan null)
- [ ] Email match dengan yang login

**Browser:**

- [ ] Clear cache & cookies
- [ ] Hard reload (Ctrl+Shift+R)
- [ ] Console tidak ada error
- [ ] Console menunjukkan profile logs

**UI:**

- [ ] Profile dropdown show correct data
- [ ] Role & NIM tidak "not set"
- [ ] Badge "Admin" muncul
- [ ] Menu "Admin" muncul di navbar
- [ ] Logout button bekerja

---

## 🎯 Expected Behavior Setelah Fix

### Login Flow:

```
1. Login dengan Google → Redirect ke /auth/callback
2. Callback process → Check/create profile di database
3. Middleware runs → Auto-assign admin role (if in admin emails list)
4. Redirect to /dashboard
5. Navbar fetch profile → Show correct role & nim
```

### Profile Display:

```
Dropdown Profile:
├─ 👤 KWIK ANDREAS JONATHAN
├─ 📧 s32230111@student.ubm.ac.id
├─ 🎖️ Badge: Admin (jika admin)
├─ ℹ️ Role: admin | NIM: 32230111
├─ 🔄 Refresh Profile (button)
├─ ─────────
├─ ⚙️ Dashboard Admin (jika admin)
├─ 👤 Dashboard Member (jika admin)
├─ ─────────
└─ 🚪 Keluar
```

### Logout Flow:

```
1. Click "🚪 Keluar"
2. Clear localStorage, sessionStorage, cookies
3. Call supabase.auth.signOut({ scope: 'global' })
4. Clear component state
5. window.location.replace('/auth/login')
6. Complete page reload
7. Show "Masuk dengan Google UBM" button
```

---

## 🚀 Quick Test Commands

```bash
# Terminal 1: Check if server running
# Should be already running

# Browser Console (F12):
# Test current session
const { createClient } = await import('/src/lib/supabase/client.ts');
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log(data.session?.user);

# Test profile fetch
const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.session?.user?.id).single();
console.log(profile);

# Manual logout if needed
localStorage.clear(); sessionStorage.clear(); window.location.replace('/auth/login');
```

---

## 📞 Langkah Berikutnya

1. **Buka Incognito Window** (Ctrl+Shift+N)
2. **Go to:** `http://localhost:3000/auth/login`
3. **Login** dengan `s32230111@student.ubm.ac.id`
4. **Klik foto profile** → Check role & nim
5. **Jika masih "not set"** → Klik "🔄 Refresh Profile"
6. **Test logout** → Klik "🚪 Keluar"
7. **Report hasil:**
   - ✅ Berhasil / ❌ Masih error
   - Screenshot console logs
   - Screenshot dropdown profile

Mari test sekarang! 🎯
