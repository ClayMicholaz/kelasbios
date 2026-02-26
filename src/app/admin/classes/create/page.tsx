"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function CreateClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_hours: 2,
    classroom: "",
    max_participants: 30,
    class_date: "",
    class_time: "",
    class_end_time: "",
    registration_deadline: "",
  });

  const [materials, setMaterials] = useState<string[]>([""]);
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);
  const [practiceQuestions, setPracticeQuestions] = useState<string>("");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleMaterialChange = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
  };

  const addMaterial = () => {
    setMaterials([...materials, ""]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      setError("Hanya file PDF yang diperbolehkan");
      return;
    }

    setMaterialFiles((prev) => [...prev, ...pdfFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setMaterialFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log("[CreateClass] Starting form submission");
    console.log("[CreateClass] Form data:", formData);
    console.log("[CreateClass] About to enter try block...");

    try {
      console.log("[CreateClass] Inside try block");
      console.log("[CreateClass] Creating supabase client...");
      const supabase = createClient();
      console.log("[CreateClass] Supabase client created successfully");

      console.log("[CreateClass] Getting authenticated user...");

      // Use getSession instead of getUser - more reliable, doesn't hang
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      console.log("[CreateClass] ✓ Session retrieved");
      console.log(
        "[CreateClass] Session:",
        session?.user?.email || "No session",
      );

      if (authError) {
        console.error("[CreateClass] Auth error:", authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }

      const user = session?.user;
      if (!user) {
        console.error("[CreateClass] No authenticated user");
        throw new Error("Not authenticated");
      }

      console.log("[CreateClass] User authenticated:", user.id);
      console.log("[CreateClass] User email:", user.email);

      // Validate dates
      console.log("[CreateClass] Validating dates...");
      console.log("[CreateClass] Class date:", formData.class_date);
      console.log("[CreateClass] Class time:", formData.class_time);
      console.log(
        "[CreateClass] Registration deadline:",
        formData.registration_deadline,
      );

      // Combine class_date and class_time for accurate comparison
      const classDateTime = new Date(
        `${formData.class_date}T${formData.class_time}`,
      );
      const deadline = new Date(formData.registration_deadline);

      console.log("[CreateClass] Class DateTime object:", classDateTime);
      console.log("[CreateClass] Deadline DateTime object:", deadline);

      if (deadline >= classDateTime) {
        throw new Error(
          "Batas pendaftaran harus sebelum waktu mulai kelas. " +
            `Deadline: ${deadline.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}, ` +
            `Kelas: ${classDateTime.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
        );
      }

      console.log("[CreateClass] Date validation passed");

      // Validate practice questions JSON if provided
      let parsedQuestions = null;
      if (practiceQuestions.trim() !== "") {
        console.log("[CreateClass] Parsing practice questions...");
        try {
          parsedQuestions = JSON.parse(practiceQuestions);
          console.log(
            "[CreateClass] Parsed practice questions:",
            parsedQuestions,
          );
        } catch (parseError) {
          console.error("[CreateClass] JSON parse error:", parseError);
          throw new Error("Format JSON soal latihan tidak valid");
        }
      }

      // Upload PDF files to storage
      let uploadedFiles: Array<{ name: string; url: string }> = [];
      console.log("[CreateClass] Checking files, count:", materialFiles.length);

      if (materialFiles.length > 0) {
        console.log("[CreateClass] Uploading", materialFiles.length, "files");
        setUploadingFiles(true);

        for (const file of materialFiles) {
          const fileName = `${Date.now()}_${file.name}`;
          console.log(
            "[CreateClass] Uploading file:",
            fileName,
            "Size:",
            file.size,
            "bytes",
          );

          try {
            const { error: uploadError, data } = await supabase.storage
              .from("class-materials")
              .upload(fileName, file);

            if (uploadError) {
              console.error("[CreateClass] Upload error details:", {
                message: uploadError?.message,
                statusCode: uploadError?.statusCode,
                name: uploadError?.name,
              });
              throw uploadError;
            }

            console.log("[CreateClass] File uploaded:", fileName);

            const {
              data: { publicUrl },
            } = supabase.storage.from("class-materials").getPublicUrl(fileName);

            console.log("[CreateClass] Got public URL:", publicUrl);

            uploadedFiles.push({
              name: file.name,
              url: publicUrl,
            });

            console.log(
              "[CreateClass] File added to list, total:",
              uploadedFiles.length,
            );
          } catch (uploadErr) {
            console.error("[CreateClass] File upload caught error:", uploadErr);
            throw uploadErr;
          }
        }
        console.log(
          "[CreateClass] All",
          uploadedFiles.length,
          "files uploaded successfully",
        );
        setUploadingFiles(false);
      } else {
        console.log("[CreateClass] No files to upload, skipping");
      }

      // Filter out empty materials and combine with uploaded files
      const textMaterials = materials
        .filter((m) => m.trim() !== "")
        .map((m) => ({ name: m, url: null }));
      const allMaterials = [...textMaterials, ...uploadedFiles];

      console.log("[CreateClass] Preparing to insert class data");

      // Prepare insert data - only include class_end_time if it has a value
      const insertData: any = {
        title: formData.title,
        description: formData.description,
        duration_hours: formData.duration_hours,
        classroom: formData.classroom,
        max_participants: formData.max_participants,
        class_date: formData.class_date,
        class_time: formData.class_time,
        registration_deadline: formData.registration_deadline,
        materials: allMaterials.length > 0 ? allMaterials : null,
        practice_questions: parsedQuestions,
        created_by: user.id,
        status: "open",
      };

      // Only add class_end_time if it has a value (optional field)
      if (formData.class_end_time) {
        insertData.class_end_time = formData.class_end_time;
      }

      console.log("[CreateClass] Insert data prepared:", insertData);
      console.log("[CreateClass] Starting database insert...");

      try {
        const { data: insertedData, error: insertError } = await supabase
          .from("classes")
          .insert(insertData)
          .select();

        console.log("[CreateClass] Insert completed");
        console.log("[CreateClass] Insert error:", insertError);
        console.log("[CreateClass] Inserted data:", insertedData);

        if (insertError) {
          console.error("[CreateClass] Database insert error details:", {
            code: insertError?.code,
            message: insertError?.message,
            details: insertError?.details,
            hint: insertError?.hint,
          });
          throw new Error(
            `Database error: ${insertError?.message || "Unknown error"}`,
          );
        }

        if (!insertedData || insertedData.length === 0) {
          throw new Error("No data returned from insert");
        }

        console.log("[CreateClass] Class created successfully:", insertedData);
        console.log("[CreateClass] Redirecting to /admin/classes");

        // Show success message
        alert(
          `✅ Kelas "${formData.title}" berhasil dibuat!\n\nKelas akan muncul di list dalam beberapa detik.`,
        );

        // Redirect to admin classes page
        router.push("/admin/classes");
        router.refresh();
      } catch (dbError: any) {
        console.error("[CreateClass] Database operation failed:", dbError);
        throw dbError;
      }
    } catch (err: any) {
      console.error("[CreateClass] =================================");
      console.error("[CreateClass] ERROR CAUGHT IN MAIN HANDLER");
      console.error("[CreateClass] Error type:", typeof err);
      console.error("[CreateClass] Error name:", err?.name);
      console.error("[CreateClass] Error message:", err?.message);
      console.error("[CreateClass] Error stack:", err?.stack);
      console.error("[CreateClass] Full error object:", err);
      console.error("[CreateClass] =================================");
      setError(err.message || "Terjadi kesalahan saat membuat kelas");
    } finally {
      console.log("[CreateClass] Finally block - cleaning up");
      setLoading(false);
      setUploadingFiles(false);
      console.log("[CreateClass] Loading state set to false");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/classes"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Daftar Kelas
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Buat Kelas Baru
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Kelas *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Pengenalan React.js"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Kelas *
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Jelaskan detail tentang kelas ini..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi (jam) *
                </label>
                <input
                  type="number"
                  name="duration_hours"
                  required
                  min="0.5"
                  step="0.5"
                  value={formData.duration_hours}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ruangan *
                </label>
                <input
                  type="text"
                  name="classroom"
                  required
                  value={formData.classroom}
                  onChange={handleChange}
                  placeholder="Contoh: Lab 301"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimal Peserta *
              </label>
              <input
                type="number"
                name="max_participants"
                required
                min="1"
                value={formData.max_participants}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Kelas *
                </label>
                <input
                  type="date"
                  name="class_date"
                  required
                  value={formData.class_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Mulai *
                </label>
                <input
                  type="time"
                  name="class_time"
                  required
                  value={formData.class_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Selesai (Opsional)
                </label>
                <input
                  type="time"
                  name="class_end_time"
                  value={formData.class_end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kosongkan jika belum migrate database
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batas Pendaftaran *
              </label>
              <input
                type="datetime-local"
                name="registration_deadline"
                required
                value={formData.registration_deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
              <p className="text-sm text-gray-500 mt-1">
                Harus sebelum tanggal kelas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materi yang Dipelajari (Deskripsi)
              </label>
              <div className="space-y-3">
                {materials.map((material, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={material}
                      onChange={(e) =>
                        handleMaterialChange(index, e.target.value)
                      }
                      placeholder="Contoh: Introduction to React Components"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    />
                    {materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        hapus
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMaterial}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  + Tambah Materi
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Materi (PDF)
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {materialFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      File yang akan diupload:
                    </p>
                    <ul className="space-y-2">
                      {materialFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            📄 {file.name} (
                            {(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Hapus
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Upload file PDF materi pembelajaran (boleh lebih dari satu)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soal Latihan (JSON Format)
              </label>
              <textarea
                value={practiceQuestions}
                onChange={(e) => setPracticeQuestions(e.target.value)}
                rows={8}
                placeholder='[{"question": "Apa itu React?", "options": ["A. Framework", "B. Library", "C. Language"], "answer": "B"}]'
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm text-gray-900"
              />
              <p className="text-sm text-gray-500 mt-1">
                Masukkan soal latihan dalam format JSON array. Opsional.
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || uploadingFiles}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFiles
                  ? "Mengupload file..."
                  : loading
                    ? "Membuat..."
                    : "Buat Kelas"}
              </button>
              <Link
                href="/admin/classes"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
