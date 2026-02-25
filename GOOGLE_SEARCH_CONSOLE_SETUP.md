# Panduan Google Search Console Verification

## Cara Menambahkan Verifikasi Google Search Console

### 1. Dapatkan Kode Verifikasi dari Google Search Console

1. Buka [Google Search Console](https://search.google.com/search-console)
2. Tambahkan property website Anda
3. Pilih metode verifikasi: **HTML tag**
4. Copy kode verifikasi yang terlihat seperti ini:
   ```html
   <meta name="google-site-verification" content="KODE_VERIFIKASI_ANDA" />
   ```
5. Copy bagian **KODE_VERIFIKASI_ANDA** saja (tanpa meta tag)

### 2. Masukkan Kode ke File Layout

1. Buka file: `src/app/layout.tsx`
2. Temukan bagian `metadata`:
   ```typescript
   export const metadata: Metadata = {
     title: "BIOS LMS - Learning Management System",
     description:
       "Platform pembelajaran eksklusif untuk mahasiswa Teknik Informatika UBM",
     verification: {
       google: "YOUR_GOOGLE_SEARCH_CONSOLE_CODE", // ← GANTI INI
     },
   };
   ```
3. Ganti `YOUR_GOOGLE_SEARCH_CONSOLE_CODE` dengan kode verifikasi Anda
4. Contoh:
   ```typescript
   verification: {
     google: "abc123def456ghi789jkl",
   },
   ```

### 3. Deploy dan Verifikasi

1. Commit dan push perubahan ke GitHub
2. Tunggu Vercel deploy selesai
3. Kembali ke Google Search Console
4. Klik tombol **Verify**

### Metode Verifikasi Alternatif

Jika metode HTML tag tidak berhasil, Anda bisa gunakan metode lain:

#### A. Upload File HTML (Recommended untuk Debugging)

1. Buat file HTML di folder `public/`
   - Contoh: `public/google1234567890abcdef.html`
2. Isi file dengan kode yang diberikan Google
3. Deploy ke Vercel
4. Akses file via: `https://yourdomain.com/google1234567890abcdef.html`
5. Klik Verify di Google Search Console

#### B. Verifikasi via DNS (Untuk Domain Custom)

1. Pilih metode **DNS record**
2. Tambahkan TXT record ke DNS provider Anda:
   ```
   Type: TXT
   Name: @
   Value: google-site-verification=KODE_ANDA
   ```
3. Tunggu propagasi DNS (bisa 24-48 jam)
4. Klik Verify

## Troubleshooting

### Meta Tag Tidak Terdeteksi

**Penyebab:**

- Cache browser atau CDN
- Meta tag tidak di `<head>`
- Kode salah

**Solusi:**

1. Clear cache browser (Ctrl+Shift+Del)
2. Check source code halaman (Ctrl+U)
3. Pastikan meta tag ada di `<head>`
4. Gunakan metode file HTML sebagai alternatif

### File HTML 404

**Penyebab:**

- File tidak di folder `public/`
- Deploy belum selesai

**Solusi:**

1. Pastikan file ada di `public/`, bukan subfolder
2. Tunggu deploy Vercel selesai
3. Test akses file langsung di browser

## Next.js Metadata API Reference

Next.js akan otomatis render metadata sebagai HTML tags:

```typescript
export const metadata: Metadata = {
  // <title>
  title: "My App",

  // <meta name="description">
  description: "App description",

  // <meta name="google-site-verification">
  verification: {
    google: "code",
    yandex: "code",
    yahoo: "code",
  },

  // Open Graph
  openGraph: {
    title: "My App",
    description: "Description",
    images: ["/og-image.jpg"],
  },
};
```

Dokumentasi lengkap: [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
