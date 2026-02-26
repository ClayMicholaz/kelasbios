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
      // Validate file type - only allow specific image formats
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Format file tidak didukung. Gunakan JPEG, PNG, atau WebP");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setError(`Ukuran file terlalu besar (${fileSizeMB}MB). Maksimal 5MB`);
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

      // Get signed URL for private bucket (valid for 10 years)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10); // 10 years

      if (urlError) throw urlError;
      if (!signedUrlData?.signedUrl)
        throw new Error("Failed to get signed URL");

      // Update enrollment with payment proof
      const { error: updateError } = await supabase
        .from("enrollments")
        .update({
          payment_proof: signedUrlData.signedUrl,
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
      console.error("Upload error:", err);
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
          className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? "Mengunggah..."
            : isReupload
              ? "Upload Ulang Bukti"
              : "Upload Bukti Pembayaran"}
        </button>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-4">
          <p className="text-sm font-semibold text-primary-900 mb-2">
            Informasi Pembayaran:
          </p>
          <div className="text-sm text-primary-800 space-y-1">
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
              {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "Christoper Harris"}
            </p>
            <p>
              <strong>Jumlah:</strong> Rp 10.000
            </p>
          </div>
          <p className="text-xs text-primary-700 mt-3 pt-2 border-t border-primary-200">
            <strong>Limitasi Upload:</strong>
            <br />
            • Format: JPEG, PNG, atau WebP
            <br />
            • Ukuran maksimal: 5MB
            <br />• Pastikan bukti transfer jelas dan dapat dibaca
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
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
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
