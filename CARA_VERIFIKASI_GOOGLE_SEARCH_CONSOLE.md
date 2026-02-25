# 🔑 Cara Mendapatkan Kode Verifikasi Google Search Console

## ⚠️ PENTING: Format Kode Verifikasi

Saat ini kode verifikasi di `layout.tsx` masih **SALAH FORMAT**:

```typescript
// ❌ SALAH - Ini format filename, bukan kode verifikasi
verification: {
  google: "googleb19843a5ec79ff64.html",
}

// ✅ BENAR - Hanya kode verifikasi saja
verification: {
  google: "b19843a5ec79ff64",
}
```

---

## 📋 Step-by-Step Mendapatkan Kode yang Benar

### STEP 1: Buka Google Search Console

1. Pergi ke: [https://search.google.com/search-console](https://search.google.com/search-console)
2. Login dengan akun Google Anda
3. Klik **Add Property** atau **Tambahkan Properti**

### STEP 2: Pilih Jenis Property

Pilih **URL prefix** dan masukkan:

```
https://kelasbios.vercel.app
```

Klik **Continue**

### STEP 3: Pilih Metode HTML Tag

1. Di halaman verifikasi, pilih tab **HTML tag**
2. Anda akan melihat kode seperti ini:

```html
<meta name="google-site-verification" content="abc123XYZ456def789GHI012jkl" />
```

### STEP 4: Copy HANYA Bagian Content

Yang Anda butuhkan adalah **HANYA** string di dalam `content="..."`:

```
abc123XYZ456def789GHI012jkl
```

**BUKAN** yang ini:

- ❌ `<meta name="google-site-verification" content="abc123..." />`
- ❌ `googleabc123.html`
- ❌ Seluruh tag HTML
- ❌ File HTML

**YANG BENAR:**

- ✅ `abc123XYZ456def789GHI012jkl` (string dari content saja)

### STEP 5: Update File layout.tsx

1. Buka file `src/app/layout.tsx`
2. Cari bagian `verification:`
3. Ganti kode yang ada:

```typescript
verification: {
  google: "abc123XYZ456def789GHI012jkl", // ← Paste kode Anda di sini
},
```

**Contoh dengan kode Anda yang sekarang:**

Jika Google memberikan:

```html
<meta name="google-site-verification" content="googleb19843a5ec79ff64" />
```

Maka yang di-paste ke layout.tsx adalah:

```typescript
verification: {
  google: "googleb19843a5ec79ff64", // Tanpa .html
},
```

**ATAU** jika file HTML yang diberikan adalah `googleb19843a5ec79ff64.html`, maka:

- Content meta tag-nya kemungkinan: `b19843a5ec79ff64` (tanpa prefix "google")
- Cek lagi di Google Search Console tab "HTML tag" untuk mendapatkan kode yang tepat

### STEP 6: Deploy ke Vercel

```bash
git add src/app/layout.tsx
git commit -m "Add Google Search Console verification"
git push
```

Tunggu deploy selesai (1-2 menit)

### STEP 7: Verifikasi

1. Buka production URL: `https://kelasbios.vercel.app`
2. View Page Source (Ctrl+U)
3. Cari `google-site-verification` di `<head>`
4. Pastikan ada meta tag dengan kode Anda
5. Kembali ke Google Search Console
6. Klik tombol **Verify**
7. ✅ Success!

---

## 🐛 Troubleshooting

### Metode Alternatif: HTML File Upload

Jika metode HTML tag tidak berhasil, gunakan metode file:

1. **Di Google Search Console:**
   - Pilih metode **HTML file**
   - Download file (contoh: `googleb19843a5ec79ff64.html`)

2. **Di Project Anda:**
   - Taruh file di folder `public/`
   - File akan otomatis tersedia di: `https://kelasbios.vercel.app/googleb19843a5ec79ff64.html`

3. **Deploy:**

   ```bash
   git add public/googleb19843a5ec79ff64.html
   git commit -m "Add GSC verification file"
   git push
   ```

4. **Test:**
   - Buka di browser: `https://kelasbios.vercel.app/googleb19843a5ec79ff64.html`
   - Pastikan file bisa diakses
   - Google Search Console → Klik **Verify**

---

## ✅ Verification Checklist

- [ ] Dapatkan kode verifikasi dari Google Search Console (tab HTML tag)
- [ ] Copy HANYA string dari `content="..."` (tanpa quotes, tanpa tag HTML)
- [ ] Update `layout.tsx` dengan kode yang benar
- [ ] Deploy ke Vercel
- [ ] Test di browser - lihat page source untuk memastikan meta tag ada
- [ ] Verify di Google Search Console
- [ ] Done! 🎉

---

## 📚 Resources

- [Google Search Console](https://search.google.com/search-console)
- [Next.js Metadata Verification](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#verification)
- [Tutorial Lengkap GSC](./GOOGLE_SEARCH_CONSOLE_SETUP.md)
