"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface PaymentUploadProps {
  enrollmentId: string;
  isReupload?: boolean;
}

export default function PaymentUpload({
  enrollmentId,
  isReupload = false,
}: PaymentUploadProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Hanya file gambar yang diperbolehkan");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setShowModal(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${enrollmentId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);

      // Update enrollment with payment proof
      const { error: updateError } = await supabase
        .from("enrollments")
        .update({
          payment_proof: publicUrl,
          payment_date: new Date().toISOString(),
          payment_status: "pending", // Reset to pending if reupload
        })
        .eq("id", enrollmentId);

      if (updateError) throw updateError;

      setShowModal(false);
      setSelectedFile(null);
      router.refresh();

      alert("Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengunggah");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? "Mengunggah..."
            : isReupload
              ? "Upload Ulang Bukti"
              : "Upload Bukti Pembayaran"}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            Informasi Pembayaran:
          </p>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Bank:</strong>{" "}
              {process.env.NEXT_PUBLIC_BANK_NAME || "BCA"}
            </p>
            <p>
              <strong>No. Rekening:</strong>{" "}
              {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "1234567890"}
            </p>
            <p>
              <strong>Atas Nama:</strong>{" "}
              {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "BIOS Organization"}
            </p>
            <p>
              <strong>Jumlah:</strong> Rp 10.000
            </p>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            * Upload bukti transfer setelah melakukan pembayaran
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Konfirmasi Upload Bukti Pembayaran
            </h3>

            {selectedFile && (
              <div className="mb-4">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  File: {selectedFile.name}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-6">
              Pastikan bukti pembayaran jelas dan dapat dibaca. Proses
              verifikasi akan dilakukan oleh admin.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedFile(null);
                }}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {uploading ? "Mengunggah..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
