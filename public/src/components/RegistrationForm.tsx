"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { extractNIMFromEmail, canEditNIM, validateNIM } from "@/lib/nimUtils";
import {
  generateFileNameFromData,
  generateFallbackFileName,
  getFileExtension,
  isImageFile,
  validateFileSize,
  getReadableFileSize,
} from "@/lib/fileUtils";
import { Button } from "@/components/ui/Button";
import { Input } from "./ui/Input";
import { Select } from "@/components/ui/SelectImproved";
import { useToast } from "@/hooks/useToast";
import { DIVISI_OPTIONS } from "@/constants";

interface RegistrationFormProps {
  onSubmitSuccessAction: () => void;
}

export default function RegistrationForm({
  onSubmitSuccessAction,
}: RegistrationFormProps) {
  const { user, signOut, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nim: "",
    nama: "",
    no_hp: "",
    foto_diri: "",
    link_portofolio: [""],
    divisi_pertama: "",
    divisi_kedua: "",
  });

  // Function to get user display name
  const getUserDisplayName = () => {
    if (!user) return "";

    // First try to get name from Google account metadata
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }

    // If no full name, try to extract name from email
    if (user.email) {
      const emailParts = user.email.split("@")[0];
      // Remove dots and numbers, capitalize each word
      const nameFromEmail = emailParts
        .replace(/\.|\d+/g, " ")
        .split(" ")
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
        .trim();

      return nameFromEmail || user.email.split("@")[0];
    }

    return "Pengguna";
  };

  // Auto-fill data from user account when component mounts
  useEffect(() => {
    if (user?.email) {
      const nim = extractNIMFromEmail(user.email);
      if (nim) {
        setFormData((prev) => ({
          ...prev,
          nim: nim,
        }));
      }
    }

    // Auto-fill nama from Google account
    if (user?.user_metadata?.full_name && !formData.nama) {
      setFormData((prev) => ({
        ...prev,
        nama: user.user_metadata.full_name,
      }));
    }
  }, [user, formData.nama]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Sesi login tidak valid. Silakan login ulang.</p>
          <Button onClick={() => (window.location.href = "/")}>
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePortfolioChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      link_portofolio: prev.link_portofolio.map((link, i) =>
        i === index ? value : link
      ),
    }));
  };

  const addPortfolioLink = () => {
    setFormData((prev) => ({
      ...prev,
      link_portofolio: [...prev.link_portofolio, ""],
    }));
  };

  const removePortfolioLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      link_portofolio: prev.link_portofolio.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return null;

    try {
      // Validate file type and size
      if (!isImageFile(file)) {
        throw new Error("File harus berupa gambar (JPG, PNG, dll)");
      }

      if (!validateFileSize(file, 5)) {
        throw new Error(
          `File terlalu besar. Maksimal 5MB. Size saat ini: ${getReadableFileSize(
            file.size
          )}`
        );
      }

      const fileExt = getFileExtension(file.name);

      // Create filename using NIM_Nama format if available, otherwise fallback to user.id
      let fileName: string;

      if (formData.nim && formData.nama) {
        fileName = generateFileNameFromData(
          formData.nim,
          formData.nama,
          fileExt
        );
      } else {
        fileName = generateFallbackFileName(user.id, fileExt);
      }

      // Try to upload with the preferred filename
      let uploadError = null;
      const { error } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file);

      uploadError = error;

      // If file already exists, add timestamp to make it unique
      if (
        uploadError &&
        (uploadError.message.includes("duplicate") ||
          uploadError.message.includes("already exists"))
      ) {
        if (formData.nim && formData.nama) {
          fileName = generateFileNameFromData(
            formData.nim,
            formData.nama,
            fileExt,
            true
          );
        } else {
          fileName = generateFallbackFileName(user.id, fileExt);
        }

        const { error: retryError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, file);

        if (retryError) throw retryError;
      } else if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Validate user authentication first
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        addToast("Sesi login tidak valid. Silakan login ulang.", "error");
        signOut();
        return;
      }

      // Validate form
      if (
        !formData.nim ||
        !formData.nama ||
        !formData.no_hp ||
        !formData.foto_diri ||
        !formData.divisi_pertama
      ) {
        addToast(
          "Field wajib: NIM, Nama, No HP, Foto Diri, dan Divisi Pertama. Link portofolio dan Divisi Kedua bersifat opsional.",
          "warning"
        );
        return;
      }

      // Validate NIM format
      if (!validateNIM(formData.nim)) {
        addToast("NIM harus 8 digit angka", "error");
        return;
      }

      // Check if divisi_pertama and divisi_kedua are different (only if divisi_kedua is selected)
      if (
        formData.divisi_kedua &&
        formData.divisi_pertama === formData.divisi_kedua
      ) {
        addToast("Pilihan divisi pertama dan kedua harus berbeda", "warning");
        return;
      }

      // Filter out empty portfolio links
      const portfolioLinks = formData.link_portofolio.filter(
        (link) => link.trim() !== ""
      );

      // Submit registration
      const { error } = await supabase.from("registrations").insert({
        user_id: currentUser.id, // Use verified current user ID
        nim: formData.nim,
        nama: formData.nama,
        no_hp: formData.no_hp,
        foto_diri: formData.foto_diri,
        link_portofolio:
          portfolioLinks.length > 0 ? portfolioLinks.join(", ") : null,
        divisi_pertama: formData.divisi_pertama,
        divisi_kedua: formData.divisi_kedua || null,
      });

      if (error) {
        console.error("Database insert error:", error);
        if (error.code === "23505") {
          addToast("Anda sudah pernah mendaftar sebelumnya", "warning");
        } else if (error.code === "23503") {
          addToast(
            "Sesi login tidak valid. Silakan logout dan login ulang.",
            "error"
          );
          signOut();
        } else {
          addToast(
            "Terjadi kesalahan saat mendaftar: " + error.message,
            "error"
          );
        }
        return;
      }

      addToast("Data pendaftaran Anda telah berhasil disimpan!", "success");

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000); // Wait 2 seconds to show the success message

      onSubmitSuccessAction();
    } catch (error: unknown) {
      console.error("Error submitting registration:", error);

      // Handle specific database errors
      const dbError = error as { code?: string; message?: string };
      if (dbError?.code === "23503") {
        addToast(
          "Sesi login tidak valid. Silakan logout dan login ulang.",
          "error"
        );
        signOut();
      } else if (dbError?.code === "23505") {
        addToast("Anda sudah pernah mendaftar sebelumnya", "warning");
      } else {
        addToast(
          "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if NIM and nama are filled for better filename
    if (!formData.nim || !formData.nama) {
      const proceed = confirm(
        "Untuk nama file yang lebih baik, isi NIM dan Nama terlebih dahulu. Lanjut upload foto sekarang?"
      );
      if (!proceed) {
        e.target.value = ""; // Clear the file input
        return;
      }
    }

    try {
      setLoading(true);
      const photoUrl = await handleFileUpload(file);
      if (photoUrl) {
        handleInputChange("foto_diri", photoUrl);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal upload foto";
      console.error("Upload error:", err);
      // Show specific error message
      addToast(message, "error");
      e.target.value = ""; // Clear the file input on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-2 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Pendaftaran Open Recruitment BIOS 2025
            </h1>
            <Button onClick={signOut} variant="danger" size="sm">
              Logout
            </Button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <p className="text-blue-700 font-medium">
                Selamat datang, {getUserDisplayName()}!
              </p>
              <p className="text-blue-600 text-xs mt-1">Email: {user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Induk Mahasiswa *
              </label>
              <Input
                type="text"
                value={formData.nim}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("nim", e.target.value)
                }
                placeholder={
                  canEditNIM(user?.email || "")
                    ? "Contoh: 2023110001"
                    : "Diambil dari email Anda"
                }
                className={
                  !canEditNIM(user?.email || "")
                    ? "text-gray-900 bg-gray-100 cursor-not-allowed"
                    : "text-gray-900"
                }
                readOnly={!canEditNIM(user?.email || "")}
                disabled={!canEditNIM(user?.email || "")}
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
                  Masukkan NIM sesuai Kartu Tanda Mahasiswa
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap *
              </label>
              <Input
                type="text"
                value={formData.nama}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("nama", e.target.value)
                }
                placeholder="Nama lengkap sesuai KTM"
                className="text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor HP *
              </label>
              <Input
                type="tel"
                value={formData.no_hp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("no_hp", e.target.value)
                }
                placeholder="08xxxxxxxxxx"
                className="text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Diri *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                💡 Tip: Isi NIM dan Nama terlebih dahulu untuk nama file yang
                lebih terorganisir
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required={!formData.foto_diri}
              />
              {formData.foto_diri && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Foto berhasil diupload
                  {formData.nim && formData.nama && (
                    <span className="block text-xs text-gray-500 mt-1">
                      Format nama file:{" "}
                      {formData.nim.replace(/[^a-zA-Z0-9]/g, "")}_
                      {formData.nama
                        .replace(/[^a-zA-Z0-9\s]/g, "")
                        .replace(/\s+/g, "_")}
                      .jpg
                    </span>
                  )}
                </p>
              )}
              {!formData.foto_diri && formData.nim && formData.nama && (
                <p className="mt-1 text-xs text-blue-600">
                  📁 File akan disimpan sebagai:{" "}
                  {formData.nim.replace(/[^a-zA-Z0-9]/g, "")}_
                  {formData.nama
                    .replace(/[^a-zA-Z0-9\s]/g, "")
                    .replace(/\s+/g, "_")}
                  .jpg
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Portofolio (Opsional)
              </label>
              <div className="space-y-3">
                {formData.link_portofolio.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="url"
                      value={link}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handlePortfolioChange(index, e.target.value)
                      }
                      placeholder="https://..."
                      className="text-gray-900 flex-1"
                    />
                    {formData.link_portofolio.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePortfolioLink(index)}
                        variant="danger"
                        size="sm"
                        className="px-3"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addPortfolioLink}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  + Tambah Link Portofolio
                </Button>
              </div>
            </div>

            <Select
              label="Pilihan Divisi Pertama *"
              value={formData.divisi_pertama}
              onChange={(value: string) =>
                handleInputChange("divisi_pertama", value)
              }
              placeholder="Pilih divisi"
              required
            >
              {DIVISI_OPTIONS.map((divisi) => (
                <option key={divisi} value={divisi}>
                  {divisi}
                </option>
              ))}
            </Select>

            <Select
              label="Pilihan Divisi Kedua (Opsional)"
              value={formData.divisi_kedua}
              onChange={(value: string) =>
                handleInputChange("divisi_kedua", value)
              }
              placeholder="Pilih divisi (opsional)"
              required={false}
            >
              <option value="">-- Tidak memilih --</option>
              {DIVISI_OPTIONS.filter((d) => d !== formData.divisi_pertama).map(
                (divisi) => (
                  <option key={divisi} value={divisi}>
                    {divisi}
                  </option>
                )
              )}
            </Select>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Submit Pendaftaran"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
