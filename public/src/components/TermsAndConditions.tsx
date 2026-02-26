"use client";

interface TermsAndConditionsProps {
  onAcceptAction: () => void;
  bankAccount: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
}

export default function TermsAndConditions({
  onAcceptAction,
  bankAccount,
}: TermsAndConditionsProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Syarat dan Ketentuan
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pendaftaran Kelas Persiapan Ujian Akhir Semester
          </h2>

          <div className="space-y-6 text-gray-700 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                1. Biaya Pendaftaran
              </h3>
              <p>
                Setiap peserta wajib membayar biaya pendaftaran sebesar{" "}
                <span className="font-bold text-blue-600">Rp 15.000</span> per
                sesi kelas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                2. Metode Pembayaran
              </h3>
              <p>Pembayaran dilakukan melalui transfer bank ke rekening:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                <div className="space-y-1">
                  <p className="font-semibold">
                    Bank:{" "}
                    <span className="text-blue-600">{bankAccount.bank}</span>
                  </p>
                  <p className="font-semibold">
                    No. Rekening:{" "}
                    <span className="text-blue-600">
                      {bankAccount.accountNumber}
                    </span>
                  </p>
                  <p className="font-semibold">
                    Atas Nama:{" "}
                    <span className="text-blue-600">
                      {bankAccount.accountName}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                3. Konfirmasi Pembayaran
              </h3>
              <p>
                Setelah melakukan pembayaran, peserta wajib mengunggah
                screenshot bukti transfer pada form pendaftaran.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                4. Kebijakan Kehadiran dan Pengembalian Dana
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                <p className="font-semibold text-red-800">⚠️ PENTING:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-red-700">
                  <li>
                    <span className="font-semibold">
                      TIDAK ADA PENGEMBALIAN DANA
                    </span>{" "}
                    apabila peserta sudah mendaftar dan melakukan pembayaran
                    tetapi tidak hadir
                  </li>
                  <li>
                    Dana yang telah dibayarkan bersifat{" "}
                    <span className="font-semibold">NON-REFUNDABLE</span>
                  </li>
                  <li>
                    Pastikan Anda dapat hadir sebelum melakukan pendaftaran
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                5. Verifikasi Admin
              </h3>
              <p>
                Pendaftaran Anda akan diverifikasi oleh admin setelah bukti
                pembayaran diunggah. Anda akan menerima konfirmasi melalui
                email.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">6. Kapasitas Kelas</h3>
              <p>
                Setiap kelas memiliki kapasitas terbatas. Pendaftaran akan
                ditutup otomatis ketika kapasitas penuh.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                7. Autentikasi Akun Google UBM
              </h3>
              <p>
                Pendaftaran hanya dapat dilakukan menggunakan akun Google dengan
                domain <span className="font-semibold">@student.ubm.ac.id</span>{" "}
                atau <span className="font-semibold">@ubm.ac.id</span>
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={onAcceptAction}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Saya Setuju dengan Syarat dan Ketentuan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
