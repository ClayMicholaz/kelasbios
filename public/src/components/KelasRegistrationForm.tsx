"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSession } from "@/types/formSession";
import TermsAndConditions from "@/components/TermsAndConditions";
import { formatDate } from "@/lib/dateUtils";
import {
  extractNIMFromEmail,
  canEditNIM,
  getUserType,
  validateNIM,
} from "@/lib/nimUtils";
import { BANK_ACCOUNT, KELAS_OPTIONS } from "@/constants";

interface KelasRegistrationFormProps {
  session: FormSession;
  onRegistrationSuccess?: () => void;
}

export default function KelasRegistrationForm({
  session,
  onRegistrationSuccess,
}: KelasRegistrationFormProps) {
  const { user, loading } = useAuth();
  const { addToast } = useToast();

  const [showTerms, setShowTerms] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nim: "",
    prodi: "Informatika",
    kelas: "",
  });

  // Check if user's email is from UBM domain
  const isUBMEmail =
    user?.email?.endsWith("@student.ubm.ac.id") ||
    user?.email?.endsWith("@ubm.ac.id");

  useEffect(() => {
    if (user && isUBMEmail) {
      checkExistingRegistration();
      fetchRegistrationsCount();

      // Auto-fill nama from Google account if available
      if (user.user_metadata?.full_name && !formData.nama_lengkap) {
        setFormData((prev) => ({
          ...prev,
          nama_lengkap: user.user_metadata.full_name,
        }));
      }

      // Auto-fill NIM from email if available
      const extractedNIM = extractNIMFromEmail(user.email || "");
      if (extractedNIM && !formData.nim) {
        setFormData((prev) => ({
          ...prev,
          nim: extractedNIM,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, user]);

  const checkExistingRegistration = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("kelas_registrations")
      .select("*")
      .eq("session_id", session.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setIsRegistered(true);
      setFormData({
        nama_lengkap: data.nama_lengkap,
        nim: data.nim,
        prodi: data.prodi || "IT",
        kelas: data.kelas || "",
      });
      setTermsAccepted(true);
      setShowTerms(false);

      if (data.bukti_pembayaran) {
        setPaymentProofPreview(data.bukti_pembayaran);
      }
    }
  };

  const fetchRegistrationsCount = async () => {
    const { count } = await supabase
      .from("kelas_registrations")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id);

    setRegistrationsCount(count || 0);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast("Ukuran file terlalu besar. Maksimal 5MB", "error");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        addToast("File harus berupa gambar", "error");
        return;
      }

      setPaymentProof(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPaymentProof = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    // console.log("Uploading to storage:", {
    //   bucket: "kelas-payments",
    //   filePath,
    // });

    const { error: uploadError } = await supabase.storage
      .from("kelas-payments")
      .upload(filePath, file);

    if (uploadError) {
      // console.error("Storage upload error:", uploadError);

      // Check if bucket exists
      if (uploadError.message.includes("Bucket not found")) {
        throw new Error("Storage bucket belum dikonfigurasi. Hubungi admin.");
      }

      throw new Error(`Gagal upload: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from("kelas-payments")
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error("Gagal mendapatkan URL bukti pembayaran");
    }

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validation
    if (!formData.nama_lengkap || !formData.nim || !formData.kelas) {
      addToast("Mohon lengkapi semua field yang diperlukan", "error");
      return;
    }

    // Validate NIM format
    if (!validateNIM(formData.nim)) {
      addToast("NIM harus 8 digit angka", "error");
      return;
    }

    // Validate name format
    if (!/^[a-zA-Z\s\.\-\']+$/.test(formData.nama_lengkap)) {
      addToast("Nama hanya boleh mengandung huruf dan spasi", "error");
      return;
    }

    if (!termsAccepted) {
      addToast("Anda harus menyetujui syarat dan ketentuan", "error");
      return;
    }

    if (!isRegistered && !paymentProof) {
      addToast("Mohon upload bukti pembayaran", "error");
      return;
    }

    // Check capacity
    if (registrationsCount >= (session.kapasitas || 15) && !isRegistered) {
      addToast("Maaf, kelas sudah penuh", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      let paymentProofUrl = paymentProofPreview;

      // Upload payment proof if new file selected
      if (paymentProof) {
        // console.log("Uploading payment proof...");
        try {
          paymentProofUrl = await uploadPaymentProof(paymentProof);
          // console.log("Payment proof uploaded:", paymentProofUrl);
        } catch (uploadError) {
          // console.error("Error uploading payment proof:", uploadError);
          throw new Error(
            "Gagal mengunggah bukti pembayaran. Mohon coba lagi."
          );
        }
      }

      // Validate payment proof URL
      if (!paymentProofUrl) {
        throw new Error("Bukti pembayaran harus diunggah.");
      }

      // console.log("Preparing registration data...");
      const registrationData = {
        session_id: session.id,
        user_id: user.id,
        nama_lengkap: formData.nama_lengkap,
        nim: formData.nim,
        prodi: formData.prodi,
        semester: 1,
        kelas: formData.kelas,
        bukti_pembayaran: paymentProofUrl,
        terms_accepted: termsAccepted,
        payment_verified: false,
      };

      // console.log("Submitting registration data:", {
      //   ...registrationData,
      //   bukti_pembayaran: paymentProofUrl ? "URL_PROVIDED" : "NULL",
      // });

      if (isRegistered) {
        // console.log("Updating existing registration...");
        const { error } = await supabase
          .from("kelas_registrations")
          .update(registrationData)
          .eq("session_id", session.id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        addToast("Data pendaftaran berhasil diperbarui!", "success");

        // Redirect to dashboard after successful update
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000); // Wait 2 seconds to show the success message
      } else {
        // console.log("Creating new registration...");
        const { error } = await supabase
          .from("kelas_registrations")
          .insert([registrationData]);

        if (error) {
          // console.error("Supabase insert error:", error);
          throw error;
        }

        addToast(
          "Pendaftaran berhasil! Admin akan memverifikasi pembayaran Anda.",
          "success"
        );
        setIsRegistered(true);

        // Show success message before redirect
        setShowSuccess(true);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 3000); // Wait 3 seconds to show the success message
      }

      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }

      await fetchRegistrationsCount();
    } catch (error: unknown) {
      // console.error("Error submitting registration:", error);

      let message = "Terjadi kesalahan saat mendaftar";

      if (error instanceof Error) {
        message = error.message;
        // console.error("Error details:", {
        //   name: error.name,
        //   message: error.message,
        //   stack: error.stack,
        // });
      } else if (typeof error === "object" && error !== null) {
        // Log the full error object for debugging
        // console.error("Error object:", JSON.stringify(error, null, 2));

        // Check if it's a Supabase error
        const supabaseError = error as any;
        if (supabaseError.message) {
          message = supabaseError.message;
        } else if (supabaseError.error_description) {
          message = supabaseError.error_description;
        }
      }

      addToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4 sm:mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              🔒
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Login Diperlukan
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Anda harus login menggunakan akun Google UBM (@student.ubm.ac.id
            atau @ubm.ac.id) untuk dapat mendaftar kelas.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login dengan Google UBM
          </Link>
        </div>
      </div>
    );
  }

  // Not UBM email
  if (!isUBMEmail) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4 sm:mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              ⚠️
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Akun Tidak Valid
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Pendaftaran hanya dapat dilakukan menggunakan akun Google dengan
            domain <strong>@student.ubm.ac.id</strong> atau{" "}
            <strong>@ubm.ac.id</strong>
          </p>
          <p className="text-sm text-gray-500">Email Anda: {user.email}</p>
        </div>
      </div>
    );
  }

  // Show terms and conditions first
  if (showTerms && !termsAccepted) {
    return (
      <TermsAndConditions
        bankAccount={BANK_ACCOUNT}
        onAcceptAction={() => {
          setTermsAccepted(true);
          setShowTerms(false);
          // Scroll to top after accepting terms
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 100);
        }}
      />
    );
  }

  // Session not active
  if (session.status !== "active") {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          Pendaftaran Kelas BIOS
        </h2>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-sm sm:text-base text-gray-600">
            {session.status === "closed"
              ? "Pendaftaran untuk kelas ini sudah ditutup"
              : session.status === "draft"
              ? "Pendaftaran belum dibuka"
              : "Kelas sudah selesai"}
          </p>
        </div>
      </div>
    );
  }

  // Show success message
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Pendaftaran Berhasil!
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Daftar berhasil, menunggu verifikasi pembayaran
              </h3>
              <div className="text-sm text-green-700 space-y-2">
                <p>📋 Data pendaftaran Anda telah tersimpan</p>
                <p>💳 Admin akan memverifikasi pembayaran Anda</p>
                <p>📧 Anda akan mendapat notifikasi setelah verifikasi</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                🔄 Mengalihkan ke dashboard dalam beberapa detik...
              </p>
              <div className="mt-3 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availableSeats = (session.kapasitas || 15) - registrationsCount;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {session.title || "Pendaftaran Kelas"}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {session.description && (
            <span className="block mb-1">{session.description}</span>
          )}
          Kelas: {formatDate(session.tanggal_kelas || "")}
        </p>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm">
            <span className="text-blue-600 font-medium">
              {registrationsCount}/{session.kapasitas || 15} peserta terdaftar
            </span>
          </div>
          <div
            className={`text-sm font-semibold ${
              availableSeats <= 5 ? "text-red-600" : "text-green-600"
            }`}
          >
            {availableSeats > 0 ? (
              <>🎯 {availableSeats} Seat Tersedia</>
            ) : (
              <>⚠️ PENUH</>
            )}
          </div>
        </div>
      </div>

      {isRegistered && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-green-800 font-medium mb-2">
            ✅ Anda sudah terdaftar
          </h3>
          <p className="text-sm text-green-700">
            Data pendaftaran Anda dapat diperbarui di bawah ini.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap *
          </label>
          <Input
            type="text"
            value={formData.nama_lengkap}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow letters, spaces, and common name characters
              if (/^[a-zA-Z\s\.\-\']*$/.test(value)) {
                handleInputChange("nama_lengkap", value);
              }
            }}
            placeholder="Nama lengkap sesuai KTM"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Hanya huruf dan spasi diperbolehkan
          </p>
        </div>

        {/* NIM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIM *
          </label>
          <Input
            type="text"
            value={formData.nim}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow numbers and max 8 digits
              if (/^\d{0,8}$/.test(value)) {
                handleInputChange("nim", value);
              }
            }}
            placeholder={
              canEditNIM(user?.email || "")
                ? "8 digit angka (contoh: 12345678)"
                : "Diambil dari email Anda"
            }
            maxLength={8}
            pattern="\d{8}"
            readOnly={!canEditNIM(user?.email || "")}
            disabled={!canEditNIM(user?.email || "")}
            className={
              !canEditNIM(user?.email || "")
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }
            required
          />
          {!canEditNIM(user?.email || "") &&
          extractNIMFromEmail(user?.email || "") ? (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              NIM diambil otomatis dari email UBM Anda
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              NIM harus 8 digit angka
            </p>
          )}
        </div>

        {/* Prodi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Program Studi *
          </label>
          <Input
            type="text"
            value={formData.prodi}
            disabled
            className="bg-gray-100"
          />
        </div>

        {/* Kelas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kelas *
          </label>
          <select
            value={formData.kelas}
            onChange={(e) => handleInputChange("kelas", e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Kelas</option>
            {KELAS_OPTIONS.map((kelas) => (
              <option key={kelas.value} value={kelas.value}>
                {kelas.label}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Informasi Pembayaran
          </h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              Bank: <span className="font-semibold">{BANK_ACCOUNT.bank}</span>
            </p>
            <p>
              No. Rekening:{" "}
              <span className="font-semibold">
                {BANK_ACCOUNT.accountNumber}
              </span>
            </p>
            <p>
              Atas Nama:{" "}
              <span className="font-semibold">{BANK_ACCOUNT.accountName}</span>
            </p>
            <p className="mt-2 font-semibold text-blue-900">
              Biaya: Rp {(session.harga || 50000).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Payment Proof Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bukti Pembayaran (Screenshot Transfer) *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePaymentProofChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: JPG, PNG (Maksimal 5MB)
          </p>

          {paymentProofPreview && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={paymentProofPreview}
                alt="Preview bukti pembayaran"
                className="max-w-xs rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            Saya telah membaca dan menyetujui{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-blue-600 hover:underline"
            >
              Syarat dan Ketentuan
            </button>
            , termasuk kebijakan tidak ada pengembalian dana jika sudah
            mendaftar dan tidak hadir.
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !termsAccepted ||
            (availableSeats <= 0 && !isRegistered)
          }
          className="w-full"
        >
          {isSubmitting
            ? "Memproses..."
            : isRegistered
            ? "Perbarui Pendaftaran"
            : availableSeats <= 0
            ? "Kelas Penuh"
            : "Daftar Kelas"}
        </Button>
      </form>
    </div>
  );
}
