import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - BIOS LMS",
  description: "Terms of Service for BIOS Learning Management System",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
          </p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Penerimaan Persyaratan
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Dengan mengakses dan menggunakan BIOS LMS (Learning Management
                System), Anda setuju untuk terikat oleh persyaratan layanan ini.
                Jika Anda tidak setuju dengan persyaratan ini, harap tidak
                menggunakan platform ini.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Kelayakan Pengguna
              </h2>
              <p className="text-gray-700 leading-relaxed">
                BIOS LMS hanya tersedia untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  Mahasiswa aktif Teknik Informatika Universitas Bunda Mulia
                </li>
                <li>
                  Pengguna dengan email @student.ubm.ac.id yang valid dan aktif
                </li>
                <li>Administrator yang ditunjuk oleh organisasi BIOS</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. Akun Pengguna
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Anda bertanggung jawab untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  Menjaga keamanan akun Google UBM Anda yang digunakan untuk
                  masuk
                </li>
                <li>Semua aktivitas yang terjadi di bawah akun Anda</li>
                <li>
                  Memberitahu administrator jika terjadi penggunaan tidak sah
                  pada akun Anda
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Pendaftaran dan Pembayaran Kelas
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Ketentuan pendaftaran kelas:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  Biaya kelas adalah Rp 10.000 per sesi (2 jam pembelajaran)
                </li>
                <li>
                  Pembayaran dilakukan melalui transfer bank ke rekening yang
                  tertera
                </li>
                <li>Bukti pembayaran harus diunggah untuk verifikasi</li>
                <li>
                  Akses materi kelas diberikan setelah pembayaran diverifikasi
                </li>
                <li>
                  Pembayaran yang sudah diverifikasi tidak dapat dikembalikan
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Penggunaan Platform
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Anda setuju untuk TIDAK:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  Membagikan akun atau akses kelas kepada pihak yang tidak
                  berhak
                </li>
                <li>Menyebarkan materi kelas tanpa izin dari BIOS</li>
                <li>Menggunakan platform untuk tujuan yang melanggar hukum</li>
                <li>Mencoba mengakses bagian sistem yang tidak diotorisasi</li>
                <li>Mengganggu atau merusak integritas platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Hak Kekayaan Intelektual
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Semua materi kelas, termasuk namun tidak terbatas pada slide
                presentasi, video, kode program, dan dokumen, adalah milik BIOS
                dan/atau instruktur yang bersangkutan. Anda tidak diperbolehkan
                untuk mendistribusikan, memodifikasi, atau menggunakan materi
                tersebut untuk tujuan komersial tanpa izin tertulis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Penghentian Layanan
              </h2>
              <p className="text-gray-700 leading-relaxed">
                BIOS berhak untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  Menangguhkan atau menghentikan akses Anda jika melanggar
                  persyaratan ini
                </li>
                <li>
                  Memodifikasi atau menghentikan layanan sewaktu-waktu tanpa
                  pemberitahuan sebelumnya
                </li>
                <li>
                  Menolak pendaftaran atau membatalkan kelas dengan
                  mengembalikan biaya
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Batasan Tanggung Jawab
              </h2>
              <p className="text-gray-700 leading-relaxed">
                BIOS LMS disediakan "sebagaimana adanya" tanpa jaminan apa pun.
                BIOS tidak bertanggung jawab atas:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Gangguan atau kesalahan teknis pada platform</li>
                <li>
                  Kehilangan data atau konten yang disebabkan oleh faktor di
                  luar kontrol kami
                </li>
                <li>
                  Kerugian tidak langsung yang mungkin timbul dari penggunaan
                  platform
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Perubahan Persyaratan
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Kami berhak mengubah persyaratan layanan ini kapan saja.
                Perubahan akan diposting di halaman ini dan akan berlaku segera
                setelah dipublikasikan. Penggunaan platform setelah perubahan
                berarti Anda menerima persyaratan yang baru.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. Hukum yang Berlaku
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Persyaratan layanan ini diatur oleh hukum Republik Indonesia.
                Setiap perselisihan akan diselesaikan melalui jalur hukum yang
                berlaku di Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                11. Kontak
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Untuk pertanyaan tentang persyaratan layanan ini, silakan
                hubungi administrator BIOS melalui email institusi Universitas
                Bunda Mulia atau melalui organisasi BIOS secara langsung.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} BIOS LMS - Universitas Bunda Mulia.
              Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
