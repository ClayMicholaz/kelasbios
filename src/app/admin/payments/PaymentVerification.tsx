"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PaymentVerificationProps {
  enrollmentId: string;
  adminId: string;
  classId: string;
  maxParticipants: number;
  currentVerified: number;
}

export default function PaymentVerification({
  enrollmentId,
  adminId,
  classId,
  maxParticipants,
  currentVerified,
}: PaymentVerificationProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleVerify = async () => {
    if (!confirm("Apakah Anda yakin ingin memverifikasi pembayaran ini?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if class is still available
      const { data: enrollments, error: countError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("class_id", classId)
        .eq("payment_status", "verified");

      if (countError) throw countError;

      const currentCount = enrollments?.length || 0;

      if (currentCount >= maxParticipants) {
        if (
          !confirm(
            `⚠️ Kelas sudah mencapai kapasitas maksimal (${maxParticipants} peserta).\n\n` +
              `Jika Anda verify pembayaran ini, kelas akan melebihi kapasitas.\n\n` +
              `Lanjutkan verifikasi?`,
          )
        ) {
          setLoading(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from("enrollments")
        .update({
          payment_status: "verified",
          verified_by: adminId,
          verified_at: new Date().toISOString(),
        })
        .eq("id", enrollmentId);

      if (updateError) throw updateError;

      router.refresh();
      alert("✅ Pembayaran berhasil diverifikasi");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      alert("❌ Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Alasan penolakan harus diisi");
      return;
    }

    if (
      !confirm(
        `Tolak pembayaran dengan alasan:\n"${rejectReason}"\n\n` +
          `Status refund akan diset ke "pending". Pastikan Anda memproses refund secepatnya.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("enrollments")
        .update({
          payment_status: "rejected",
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          refund_status: "pending",
          refund_reason: rejectReason,
        })
        .eq("id", enrollmentId);

      if (updateError) throw updateError;

      router.refresh();
      alert("✅ Pembayaran ditolak. Jangan lupa proses refund!");
      setShowRejectReason(false);
      setRejectReason("");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      alert("❌ Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const spotsLeft = maxParticipants - currentVerified;
  const isNearFull = spotsLeft <= 3;

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}

      {isNearFull && (
        <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-1 rounded">
          ⚠️ Sisa {spotsLeft} tempat
        </div>
      )}

      {!showRejectReason ? (
        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? "..." : "✓ Verifikasi"}
          </button>
          <button
            onClick={() => setShowRejectReason(true)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            ✕ Tolak
          </button>
        </div>
      ) : (
        <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <label className="block text-xs font-medium text-gray-700">
            Alasan Penolakan & Refund:
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Contoh: Kelas sudah penuh, bukti pembayaran tidak valid, dll."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-primary-500"
            rows={3}
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Konfirmasi Penolakan"}
            </button>
            <button
              onClick={() => {
                setShowRejectReason(false);
                setRejectReason("");
                setError(null);
              }}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
