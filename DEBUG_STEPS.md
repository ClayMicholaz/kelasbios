# Debug Steps - Masalah Kapasitas 20/20

## Status Perbaikan

✅ Code sudah diperbaiki di:

- `src/app/page.tsx` - Homepage
- `src/app/class/[id]/page.tsx` - Detail kelas
- `src/app/admin/classes/page.tsx` - Admin dashboard
- `src/components/ClassCard.tsx` - Component display

✅ Dev server sudah di-restart dengan fresh cache

## Langkah Verifikasi

### 1. Refresh Browser

**PENTING:** Clear cache browser terlebih dahulu

- Chrome/Edge: `Ctrl + Shift + R` (Hard Refresh)
- Firefox: `Ctrl + F5`
- Safari: `Cmd + Option + R`

### 2. Check Console Browser

Buka Developer Tools (F12) → Tab Console, akan muncul log seperti:

```
[Homepage] Class: Nama Kelas
[Homepage] - Class ID: xxx-xxx-xxx
[Homepage] - Max Participants: 20
[Homepage] - Verified Count: 2
[Homepage] - Available: 18

[ClassCard] Nama Kelas: {
  max_participants: 20,
  enrollment_count: 2,
  availableSeats: 18
}
```

### 3. Verifikasi Database

Jalankan query di Supabase SQL Editor (lihat file `CHECK_ENROLLMENT_DATA.sql`):

```sql
-- Cek berapa yang sudah verified
SELECT
    c.title,
    c.max_participants,
    COUNT(e.id) FILTER (WHERE e.payment_status = 'verified') as verified_count
FROM classes c
LEFT JOIN enrollments e ON c.class_id = e.class_id
WHERE c.status = 'open'
GROUP BY c.id, c.title, c.max_participants;
```

### 4. Check Kemungkinan Masalah

#### Jika Console Log Menunjukkan Verified Count = 0

**Artinya:** Belum ada enrollment yang di-verify admin
**Solusi:** Admin perlu verify payment di halaman `/admin/payments`

#### Jika Console Log Menunjukkan Verified Count > 0 tapi UI tetap 20/20

**Artinya:** Cache browser atau build cache
**Solusi:**

1. Hard refresh browser (Ctrl + Shift + R)
2. Clear browser cache completely
3. Coba browser lain (incognito mode)
4. Restart dev server: `npm run dev`

#### Jika Tetap Tidak Berubah

**Kemungkinan:** Wrong class_id di join
**Solusi:** Check SQL query di console log, pastikan `class_id` match

## Expected Result

Jika ada 2 member terverifikasi dari max 20 peserta, harus tampil:

```
18 / 20 kursi tersisa
```

Bukan:

```
20 / 20 kursi tersisa  ❌
```

## Testing Checklist

- [ ] Hard refresh browser (Ctrl + Shift + R)
- [ ] Check console log untuk data enrollment
- [ ] Verify di database ada enrollments dengan status 'verified'
- [ ] Pastikan admin sudah verify payment di `/admin/payments`
- [ ] Check dev server berjalan tanpa error
- [ ] Coba buka di incognito mode

## Troubleshooting

### Error: "Cannot read property enrollment_count"

ClassCard menerima undefined enrollment_count
→ Check homepage query apakah enrollment_count di-pass

### Angka tetap 20/20 setelah semua langkah

→ Kemungkinan besar belum ada data verified di database
→ Atau ada typo di field name database

### Console log tidak muncul

→ Dev server belum restart
→ File belum ter-save
→ Browser cache terlalu kuat (pakai incognito)
