Requirement website kelasbios.vercel.app:
Website ini dengan Learning Management System, dimana organisasi kampus bernama BIOS akan membuka kelas berbayar sebesar Rp10.000 untuk 1 sesi / 2jam kelas. dimana ketika kelas dibuka akan menampilkan nama topik, durasi kelas, dan apa saja yang dipelajari, serta materinya.

jadi saya ingin kamu membuatkan halaman Home yang menampilkan kelas yang lagi dibuka, login dan daftar dengan domain akun ubm @student.ubm.ac.id, lalu juga ada Member Dashboard (jika sudah membayar 10.000 dan diverifikasi admin), lalu di dashboard member akan menampilkan kelas yang diikuti (sudah dibayar).

lalu juga ada admin yang dapat membuka/membuat kelas baru, mengisi nama kelas, deskripsi kelas, isi materi berupa pdf, ruangan kelas yang akan digunakan, jumlah peserta, lalu bisa juga memasukkan soal latihan dengan json, lalu bisa juga untuk manajemen member yang baru mendaftar (membayar) untuk kelas.
di kelas yang dibuka juga bisa diatur tanggal dan jamnya, lalu ada juga tanggal dan jamnya untuk sebelum tutup pendaftaran kelas tersebut. <- Mirip marketplace. lalu juga dapat menampilkan sisa hari, sisa Seat/tempat/Peserta duduk yang tersisa.
pendaftar kelas dapat melakukan pembayaran ke rekening 100271468145

lalu buatkan juga halaman untuk error seperti 404, dan 403. lalu pastikan setiap pembayaran tidak overlapping jadi tidak akan terjadi overseat atau pendaftar yang berlebihan pada suatu kelas. lalu untuk tombol bayar hanya dapat di klik sekali dan menunggu respons jadi tidak akan terjadi double pembayaran, begitupun saat mengirim bukti pembayaran.

lalu admin juga dapat melihat list peserta lalu akan memverifikasi siapa saja yang datang seperti absensi. 
---

## 🚀 Development

### Menjalankan Server Development

```bash
npm run dev
```

Server akan berjalan di [http://localhost:3000](http://localhost:3000)

### Troubleshooting: Lock File Error

Jika mengalami error:
```
⨯ Unable to acquire lock at .next\dev\lock, is another instance of next dev running?
```

**Solusi 1 - Menggunakan script otomatis:**
```bash
npm run clean-dev
```

**Solusi 2 - Manual:**
```powershell
# 1. Stop semua proses Node.js
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# 2. Hapus folder dev
Remove-Item ".\.next\dev" -Recurse -Force

# 3. Jalankan ulang
npm run dev
```

### Build Production

```bash
npm run build
npm start
```

---

## 📝 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Deployment:** Vercel
