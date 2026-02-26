"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FormSession } from "@/types/formSession";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/SelectImproved";
import { useToast } from "@/hooks/useToast";
import KelasRegistrantsView from "@/components/admin/KelasRegistrantsView";
import SessionDetailModal from "@/components/SessionDetailModal";

export default function FormSessionManager() {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState<FormSession[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingSession, setViewingSession] = useState<FormSession | null>(
    null
  );
  const [detailSession, setDetailSession] = useState<FormSession | null>(null);
  const [registrationCounts, setRegistrationCounts] = useState<{
    [sessionId: string]: number;
  }>({});
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    session_type: "recruitment" as "recruitment" | "kelas",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    kapasitas: 15,
    tanggal_kelas: "",
    harga: 50000,
    ruangan: "",
    jam_mulai: "",
    jam_selesai: "",
    thumbnail_url: "",
  });

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("form_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);

      // Fetch registration counts for all sessions
      if (data && data.length > 0) {
        await fetchRegistrationCounts(data.map((session) => session.id));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      addToast("Gagal mengambil data session: " + message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationCounts = async (sessionIds: string[]) => {
    try {
      const counts: { [sessionId: string]: number } = {};

      // Fetch counts for all sessions at once
      for (const sessionId of sessionIds) {
        const { count, error } = await supabase
          .from("kelas_registrations")
          .select("*", { count: "exact", head: true })
          .eq("session_id", sessionId);

        if (error) {
          console.warn(
            `Failed to fetch count for session ${sessionId}:`,
            error
          );
          counts[sessionId] = 0;
        } else {
          counts[sessionId] = count || 0;
        }
      }

      setRegistrationCounts(counts);
    } catch (error) {
      console.error("Error fetching registration counts:", error);
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Try to upload directly - if bucket doesn't exist, Supabase will give a clear error
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);

        // Check if the error is due to bucket not existing
        if (
          uploadError.message.includes("Bucket not found") ||
          uploadError.message.includes("bucket") ||
          uploadError.message.includes("404")
        ) {
          throw new Error(
            "Bucket 'thumbnails' belum dibuat di Supabase Storage. " +
              "Silakan buat bucket 'thumbnails' dengan public access di dashboard Supabase Storage terlebih dahulu."
          );
        }

        throw new Error(`Gagal upload gambar: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("thumbnails").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      addToast("Mohon pilih file gambar yang valid", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast("Ukuran file terlalu besar. Maksimal 5MB", "error");
      return;
    }

    setSelectedThumbnail(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };

  const removeThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setSelectedThumbnail(null);
    setThumbnailPreview("");
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (creating) return; // Prevent multiple submissions

    try {
      setCreating(true);

      // Upload thumbnail first if selected
      let thumbnailUrl = "";
      if (selectedThumbnail) {
        try {
          setUploading(true);
          thumbnailUrl = await uploadThumbnail(selectedThumbnail);
          addToast("Thumbnail berhasil diupload!", "success");
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          // Continue without thumbnail if upload fails
          addToast(
            "Upload thumbnail gagal, melanjutkan tanpa thumbnail",
            "warning"
          );
        } finally {
          setUploading(false);
        }
      }

      // Convert datetime-local format to ISO string
      const sessionData = {
        ...formData,
        thumbnail_url: thumbnailUrl,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
        tanggal_kelas:
          formData.session_type === "kelas" && formData.tanggal_kelas
            ? formData.tanggal_kelas
            : null,
      };

      const { data, error } = await supabase
        .from("form_sessions")
        .insert([sessionData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || JSON.stringify(error));
      }

      // console.log("Session created successfully:", data);

      setSessions([data, ...sessions]);
      setShowCreateModal(false);
      setFormData({
        session_type: "recruitment",
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        kapasitas: 15,
        tanggal_kelas: "",
        harga: 50000,
        ruangan: "",
        jam_mulai: "",
        jam_selesai: "",
        thumbnail_url: "",
      });
      addToast("Session berhasil dibuat!", "success");

      // Refresh sessions list and registration counts
      await fetchSessions();
    } catch (error: unknown) {
      console.error("Error creating session:", error);
      const message = error instanceof Error ? error.message : String(error);
      addToast("Gagal membuat session: " + message, "error");
    } finally {
      setCreating(false);
    }
  };

  const toggleSessionStatus = async (
    sessionId: string,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = currentStatus ? "draft" : "active";
      const { error } = await supabase
        .from("form_sessions")
        .update({ status: newStatus })
        .eq("id", sessionId);

      if (error) throw error;

      setSessions(
        sessions.map((s) =>
          s.id === sessionId ? { ...s, status: newStatus } : s
        )
      );

      addToast(
        `Session ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}!`,
        "success"
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      addToast("Gagal mengubah status session: " + message, "error");
    }
  };

  const getSessionStatus = (session: FormSession) => {
    const now = new Date();
    const startDate = session.start_date ? new Date(session.start_date) : null;
    const endDate = session.end_date ? new Date(session.end_date) : null;

    if (session.status === "draft")
      return { text: "Draft", color: "text-gray-500" };
    if (session.status === "closed")
      return { text: "Ditutup", color: "text-red-600" };
    if (!startDate || !endDate)
      return { text: "Aktif", color: "text-green-600" };
    if (now < startDate)
      return { text: "Belum Dimulai", color: "text-yellow-600" };
    if (now > endDate) return { text: "Berakhir", color: "text-red-600" };
    return { text: "Aktif", color: "text-green-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If viewing a session's registrants, show the detailed view
  if (viewingSession) {
    return (
      <KelasRegistrantsView
        session={viewingSession}
        onBackAction={() => setViewingSession(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Kelola Form Session
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Kelola session untuk Open Recruitment dan Kelas
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          + Buat Session Baru
        </Button>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapasitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => {
                const status = getSessionStatus(session);
                return (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.title}
                        </div>
                        {session.description && (
                          <div className="text-sm text-gray-500">
                            {session.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.session_type === "recruitment"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {session.session_type === "recruitment"
                          ? "👥 Recruitment"
                          : "📚 Kelas"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>
                          📅{" "}
                          {session.start_date
                            ? new Date(session.start_date).toLocaleString(
                                "id-ID"
                              )
                            : "-"}
                        </div>
                        <div className="text-gray-500">
                          →{" "}
                          {session.end_date
                            ? new Date(session.end_date).toLocaleString("id-ID")
                            : "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.kapasitas ? (
                        <div>
                          <span className="font-medium">
                            {registrationCounts[session.id] || 0}
                          </span>
                          <span className="text-gray-500">
                            /{session.kapasitas}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() =>
                          toggleSessionStatus(
                            session.id,
                            session.status === "active"
                          )
                        }
                        className={`px-3 py-1 rounded text-sm ${
                          session.status === "active"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {session.status === "active"
                          ? "Nonaktifkan"
                          : "Aktifkan"}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailSession(session)}
                      >
                        👁️ Detail
                      </Button>
                      {session.session_type === "kelas" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingSession(session)}
                        >
                          📋 Lihat Pendaftar
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Belum ada session yang dibuat
            </div>
            <p className="text-gray-400 mt-2">
              Buat session pertama untuk memulai
            </p>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-8 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  🎯 Buat Session Baru
                </h3>
                <p className="text-gray-600">
                  Session yang dibuat akan muncul di homepage setelah diaktifkan
                </p>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📋</span>
                    </div>
                    Informasi Dasar
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Select
                      label="Tipe Session"
                      value={formData.session_type}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          session_type: value as "recruitment" | "kelas",
                        }))
                      }
                      required
                      className="lg:col-span-1"
                    >
                      <option value="recruitment">👥 Open Recruitment</option>
                      <option value="kelas">📚 Pendaftaran Kelas</option>
                    </Select>

                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Session *
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Contoh: Kelas Python Dasar"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi (Opsional)
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Jelaskan tentang session ini..."
                        rows={3}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">⏰</span>
                    </div>
                    Jadwal
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waktu Mulai Pendaftaran *
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            start_date: e.target.value,
                          }))
                        }
                        required
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waktu Berakhir Pendaftaran *
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            end_date: e.target.value,
                          }))
                        }
                        required
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {formData.session_type === "kelas" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kapasitas Kelas
                      </label>
                      <Input
                        type="number"
                        value={formData.kapasitas}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            kapasitas: parseInt(e.target.value),
                          }))
                        }
                        min={15}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Kelas
                      </label>
                      <Input
                        type="date"
                        value={formData.tanggal_kelas}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tanggal_kelas: e.target.value,
                          }))
                        }
                        placeholder="Tanggal pelaksanaan kelas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga Kelas *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          Rp
                        </span>
                        <Input
                          type="text"
                          value={
                            formData.harga === 0
                              ? ""
                              : formData.harga.toLocaleString("id-ID")
                          }
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            const harga = parseInt(numericValue) || 0;
                            setFormData((prev) => ({
                              ...prev,
                              harga,
                            }));
                          }}
                          onBlur={(e) => {
                            // Validate on blur
                            if (
                              formData.harga < 15000 &&
                              formData.harga !== 0
                            ) {
                              setFormData((prev) => ({
                                ...prev,
                                harga: 15000,
                              }));
                            }
                          }}
                          className="pl-10"
                          placeholder="15.000"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimal Rp 15.000
                      </p>
                    </div>

                    {/* New Enhanced Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ruangan
                        </label>
                        <Input
                          type="text"
                          value={formData.ruangan}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              ruangan: e.target.value,
                            }))
                          }
                          placeholder="R502"
                          maxLength={20}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thumbnail Kelas
                        </label>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Upload File Gambar
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailSelect}
                              disabled={uploading}
                              className="w-full text-sm text-gray-500 mt-1
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {thumbnailPreview && (
                            <div className="relative mt-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="w-full h-40 object-cover rounded-lg border-2 border-blue-200"
                              />
                              <button
                                type="button"
                                onClick={removeThumbnail}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 font-bold shadow-lg"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                📷 Preview - akan diupload saat submit
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jam Mulai
                        </label>
                        <Input
                          type="time"
                          value={formData.jam_mulai}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              jam_mulai: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jam Selesai
                        </label>
                        <Input
                          type="time"
                          value={formData.jam_selesai}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              jam_selesai: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Membuat...
                      </span>
                    ) : (
                      "Buat Session"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {detailSession && (
        <SessionDetailModal
          session={detailSession}
          onClose={() => setDetailSession(null)}
          onRegister={() => {
            // Navigate to registration form
            if (typeof window !== "undefined") {
              window.open(`/register?session=${detailSession.id}`, "_blank");
            }
          }}
          registrationCount={registrationCounts[detailSession.id] || 0}
        />
      )}
    </div>
  );
}
