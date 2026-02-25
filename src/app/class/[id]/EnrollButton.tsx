"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface EnrollButtonProps {
  classId: string;
  userId: string;
  maxParticipants: number;
  currentEnrollments: number;
}

export default function EnrollButton({
  classId,
  userId,
  maxParticipants,
  currentEnrollments,
}: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const handleEnroll = async () => {
    if (!whatsappNumber || whatsappNumber.length < 10) {
      setError("Nomor WhatsApp harus diisi dengan benar (min. 10 digit)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check current enrollment count to prevent race condition
      const { data: enrollments, error: countError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("class_id", classId)
        .eq("payment_status", "verified");

      if (countError) throw countError;

      const currentCount = enrollments?.length || 0;

      if (currentCount >= maxParticipants) {
        throw new Error("Maaf, kelas sudah penuh. Silakan pilih kelas lain.");
      }

      // Create enrollment with WhatsApp number
      const { error: enrollError } = await supabase.from("enrollments").insert({
        user_id: userId,
        class_id: classId,
        payment_status: "pending",
        whatsapp_number: whatsappNumber,
      });

      if (enrollError) {
        if (enrollError.code === "23505") {
          throw new Error("Anda sudah terdaftar di kelas ini");
        }
        throw enrollError;
      }

      router.push("/dashboard?enrolled=true");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setLoading(false);
    }
  };

  const spotsLeft = maxParticipants - currentEnrollments;
  const isAlmostFull = spotsLeft <= 5 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;

  if (isFull) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-semibold">❌ Kelas Sudah Penuh</p>
        <p className="text-sm text-red-500 mt-1">
          Silakan pilih kelas lain yang tersedia
        </p>
      </div>
    );
  }

  return (
    <div>
      {!showForm ? (
        <>
          {isAlmostFull && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Hanya tersisa {spotsLeft} tempat lagi!
              </p>
            </div>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg"
          >
            Daftar Kelas Ini
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {spotsLeft} tempat tersisa dari {maxParticipants} peserta
          </p>
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-shrink-0 px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-lg text-gray-700">
                +62
              </div>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setWhatsappNumber(value);
                }}
                placeholder="81234567890"
                maxLength={13}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Nomor akan digunakan untuk komunikasi terkait kelas
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleEnroll}
              disabled={loading || !whatsappNumber}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Konfirmasi Pendaftaran"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setError(null);
                setWhatsappNumber("");
              }}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Batal
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Setelah mendaftar, upload bukti pembayaran di dashboard
          </p>
        </div>
      )}
    </div>
  );
}
