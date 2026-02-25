# 🔧 Tutorial Setup Google Cloud Console untuk OAuth

Tutorial step-by-step lengkap untuk menambahkan Redirect URI ke Google Cloud Console.

---

## 📋 Informasi yang Anda Butuhkan

Sebelum mulai, siapkan informasi berikut:

### Redirect URIs yang Perlu Ditambahkan:

```
http://localhost:3000/auth/callback
https://kelasbios.vercel.app/auth/callback
https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback
```

**Cara mendapatkan Supabase Project ID:**

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Pilih project Anda
3. Lihat URL browser: `https://app.supabase.com/project/XXXXX`
4. `XXXXX` adalah Project ID Anda
5. Atau dari Settings > API > Project URL: `https://XXXXX.supabase.co`

---

## 🚀 Langkah-Langkah Detail

### STEP 1: Buka Google Cloud Console

1. Pergi ke: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Login dengan akun Google Anda (bisa akun pribadi atau @student.ubm.ac.id)

---

### STEP 2: Pilih atau Buat Project

**Jika Project Sudah Ada:**

- Klik dropdown project di bagian atas (sebelah logo Google Cloud)
- Pilih project yang sudah Anda buat untuk BIOS LMS

**Jika Belum Ada Project:**

1. Klik dropdown project → **New Project**
2. Isi:
   - **Project name**: BIOS LMS (atau nama lain)
   - **Organization**: (biarkan default jika tidak punya)
   - **Location**: (biarkan default)
3. Klik **Create**
4. Tunggu beberapa detik hingga project dibuat

---

### STEP 3: Aktifkan Google+ API (PENTING!)

1. Di menu sebelah kiri, klik **APIs & Services** → **Library**
2. Di search bar, ketik: `Google+ API`
3. Klik hasil pencarian **Google+ API**
4. Klik tombol **ENABLE** (berwarna biru)
5. Tunggu hingga API aktif

---

### STEP 4: Buat OAuth Consent Screen (Jika Belum Ada)

1. Klik **APIs & Services** → **OAuth consent screen**
2. Pilih **External** (karena akan digunakan oleh mahasiswa UBM)
3. Klik **CREATE**
4. Isi form:
   - **App name**: BIOS LMS
   - **User support email**: email Anda
   - **Developer contact email**: email Anda
   - (field lain bisa dikosongkan untuk development)
5. Klik **SAVE AND CONTINUE**
6. Di halaman "Scopes", klik **SAVE AND CONTINUE** (tidak perlu tambah scope)
7. Di halaman "Test users", klik **SAVE AND CONTINUE**
8. Review dan klik **BACK TO DASHBOARD**

---

### STEP 5: Buat atau Edit OAuth Client ID

**Jika Sudah Ada Credentials:**

1. Klik **APIs & Services** → **Credentials**
2. Di bagian **OAuth 2.0 Client IDs**, Anda akan melihat daftar credentials
3. Klik icon **✏️ (edit/pencil)** di sebelah kanan credentials Anda

**Jika Belum Ada Credentials:**

1. Klik **APIs & Services** → **Credentials**
2. Klik tombol **+ CREATE CREDENTIALS** (di atas)
3. Pilih **OAuth client ID**
4. Pilih **Application type**: **Web application**
5. Isi **Name**: BIOS LMS OAuth Client (atau nama lain)

---

### STEP 6: Tambahkan Authorized JavaScript Origins

Di bagian **Authorized JavaScript origins**, klik **+ ADD URI** dan tambahkan satu per satu:

```
http://localhost:3000
https://kelasbios.vercel.app
https://[YOUR_SUPABASE_PROJECT_ID].supabase.co
```

**Contoh:**

```
http://localhost:3000
https://kelasbios.vercel.app
https://ezcpwobnfntjfrytaorq.supabase.co
```

**Catatan Penting:**

- ❌ JANGAN tambah trailing slash (`/`) di akhir URL
- ❌ JANGAN tambah `/auth/callback` di bagian ini
- ✅ Format: `https://domain.com` (tanpa `/` di akhir)

---

### STEP 7: Tambahkan Authorized Redirect URIs ⭐ (PENTING!)

Di bagian **Authorized redirect URIs**, klik **+ ADD URI** dan tambahkan satu per satu:

```
http://localhost:3000/auth/callback
https://kelasbios.vercel.app/auth/callback
https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback
```

**Contoh Lengkap:**

```
http://localhost:3000/auth/callback
https://kelasbios.vercel.app/auth/callback
https://ezcpwobnfntjfrytaorq.supabase.co/auth/v1/callback
```

**Catatan Penting:**

- ✅ HARUS exact match (persis sama dengan callback URL)
- ✅ Case-sensitive (huruf besar/kecil harus sama)
- ✅ `/auth/callback` untuk Next.js app Anda
- ✅ `/auth/v1/callback` untuk Supabase

---

### STEP 8: Save dan Simpan Credentials

1. Klik tombol **SAVE** (di bawah)
2. Setelah save, akan muncul popup dengan:
   - **Client ID**: `123456789-xxxxxxxxxxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxx`
3. **COPY dan SIMPAN** kedua nilai ini (akan digunakan di Supabase)

**💡 Tips:** Jika popup hilang, Anda bisa klik icon **📋 (copy)** di sebelah credentials yang sudah dibuat untuk melihat Client ID dan Client Secret lagi.

---

## ✅ Verifikasi Setup

Setelah selesai, pastikan:

- ✅ Google+ API sudah **ENABLED**
- ✅ OAuth consent screen sudah dibuat
- ✅ **3 Authorized JavaScript origins** sudah ditambahkan
- ✅ **3 Authorized redirect URIs** sudah ditambahkan (dengan `/auth/callback` dan `/auth/v1/callback`)
- ✅ Client ID dan Client Secret sudah disimpan

---

## 🔄 Update Supabase dengan Credentials

Sekarang masukkan Client ID dan Secret ke Supabase:

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Pilih project Anda
3. Klik **Authentication** → **Providers** (di sidebar)
4. Scroll ke bawah dan cari **Google**
5. Toggle switchnya menjadi ON (hijau)
6. Isi:
   - **Client ID (for OAuth)**: Paste Client ID dari Google Cloud Console
   - **Client Secret (for OAuth)**: Paste Client Secret dari Google Cloud Console
7. Klik **Save**

---

## 🧪 Test OAuth Login

1. Restart development server:

   ```bash
   npm run dev
   ```

2. Buka: `http://localhost:3000/auth/login`
3. Klik "Masuk dengan Google UBM"
4. Pilih akun @student.ubm.ac.id
5. Jika berhasil → redirect ke dashboard ✅

---

## ❌ Troubleshooting Error Umum

### Error: "redirect_uri_mismatch"

**Penyebab:** Redirect URI tidak match dengan yang di Google Cloud Console

**Solusi:**

1. Periksa kembali redirect URIs di Google Cloud Console
2. Pastikan **EXACT MATCH** (tidak ada typo, case-sensitive)
3. Cek URL di browser saat error muncul → bandingkan dengan yang di Google Cloud Console
4. Tunggu 1-2 menit setelah save (perubahan perlu waktu untuk propagate)

### Error: "origin_mismatch" atau "Origin not allowed"

**Penyebab:** JavaScript origin tidak ditambahkan

**Solusi:**

1. Pastikan Authorized JavaScript origins sudah ditambahkan
2. Check tanpa trailing slash (`/`)
3. Restart development server

### Error: "Access blocked: This app's request is invalid"

**Penyebab:** OAuth consent screen belum dikonfigurasi atau belum di-publish

**Solusi:**

1. Pastikan OAuth consent screen sudah dibuat
2. Jika untuk testing, tambahkan email Anda sebagai Test User
3. Atau publish app (untuk production)

### Error: "The OAuth client was not found"

**Penyebab:** Client ID salah atau belum disimpan di Supabase

**Solusi:**

1. Double-check Client ID di Supabase
2. Pastikan tidak ada extra spaces atau characters
3. Re-copy dari Google Cloud Console

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:

1. Screenshot error message yang muncul
2. Screenshot konfigurasi di Google Cloud Console (Authorized URIs)
3. Screenshot konfigurasi di Supabase (Google Provider)
4. Share dengan team untuk troubleshooting

---

## 📚 Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
