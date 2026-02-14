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

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Validate dates
      const classDate = new Date(formData.class_date);
      const deadline = new Date(formData.registration_deadline);

      if (deadline >= classDate) {
        throw new Error("Batas pendaftaran harus sebelum tanggal kelas");
      }

      // Validate practice questions JSON if provided
      let parsedQuestions = null;
      if (practiceQuestions.trim() !== "") {
        try {
          parsedQuestions = JSON.parse(practiceQuestions);
        } catch {
          throw new Error("Format JSON soal latihan tidak valid");
        }
      }

      // Upload PDF files to storage
      let uploadedFiles: Array<{ name: string; url: string }> = [];
      if (materialFiles.length > 0) {
        setUploadingFiles(true);

        for (const file of materialFiles) {
          const fileName = `${Date.now()}_${file.name}`;
          const { error: uploadError, data } = await supabase.storage
            .from("class-materials")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("class-materials").getPublicUrl(fileName);

          uploadedFiles.push({
            name: file.name,
            url: publicUrl,
          });
        }
      }

      // Filter out empty materials and combine with uploaded files
      const textMaterials = materials
        .filter((m) => m.trim() !== "")
        .map((m) => ({ name: m, url: null }));
      const allMaterials = [...textMaterials, ...uploadedFiles];

      const { error: insertError } = await supabase.from("classes").insert({
        ...formData,
        materials: allMaterials.length > 0 ? allMaterials : null,
        practice_questions: parsedQuestions,
        created_by: user.id,
        status: "open",
      });

      if (insertError) throw insertError;

      router.push("/admin/classes");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat membuat kelas");
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/classes"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Kelas *
                </label>
                <input
                  type="time"
                  name="class_time"
                  required
                  value={formData.class_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-1">
                Masukkan soal latihan dalam format JSON array. Opsional.
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || uploadingFiles}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
