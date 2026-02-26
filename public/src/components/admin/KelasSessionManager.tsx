"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KelasSession, KelasRegistration } from "@/types/kelas";

interface KelasSessionManagerProps {
  onSessionCreated?: () => void;
}

export default function KelasSessionManager({
  onSessionCreated,
}: KelasSessionManagerProps) {
  const { user, isAdmin } = useAuth();
  const [sessions, setSessions] = useState<KelasSession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<KelasRegistration[]>([]);

  const [newSession, setNewSession] = useState({
    tanggal_kelas: "",
    kapasitas: 15,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchSessions();
    }
  }, [isAdmin]);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("kelas_sessions")
      .select(
        `
        *,
        registrations:kelas_registrations(count)
      `
      )
      .order("tanggal_kelas", { ascending: true });

    if (!error && data) {
      const sessionsWithCount = data.map((session) => ({
        ...session,
        registrations_count: session.registrations?.[0]?.count || 0,
      }));
      setSessions(sessionsWithCount);
    }
  };

  const fetchSessionRegistrations = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("kelas_registrations")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setRegistrations(data);
    }
  };

  const createSession = async () => {
    if (!user || !newSession.tanggal_kelas) {
      alert("Mohon lengkapi tanggal kelas");
      return;
    }

    setIsCreating(true);

    try {
      const { error } = await supabase.from("kelas_sessions").insert([
        {
          tanggal_kelas: newSession.tanggal_kelas,
          kapasitas: newSession.kapasitas,
          status: "draft",
          created_by: user.id,
        },
      ]);

      if (error) throw error;

      alert("Session kelas berhasil dibuat!");
      setNewSession({ tanggal_kelas: "", kapasitas: 15 });
      await fetchSessions();
      onSessionCreated?.();
    } catch (error) {
      console.error("Create session error:", error);
      alert("Terjadi kesalahan saat membuat session");
    } finally {
      setIsCreating(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("kelas_sessions")
        .update({ status })
        .eq("id", sessionId);

      if (error) throw error;

      alert(
        `Session berhasil ${
          status === "active"
            ? "diaktifkan"
            : status === "closed"
            ? "ditutup"
            : "diperbarui"
        }`
      );
      await fetchSessions();
    } catch (error) {
      console.error("Update session error:", error);
      alert("Terjadi kesalahan saat memperbarui session");
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus session ini?")) return;

    try {
      const { error } = await supabase
        .from("kelas_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      alert("Session berhasil dihapus");
      await fetchSessions();
      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setRegistrations([]);
      }
    } catch (error) {
      console.error("Delete session error:", error);
      alert("Terjadi kesalahan saat menghapus session");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      closed: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };

    const labels = {
      draft: "Draft",
      active: "Aktif",
      closed: "Ditutup",
      completed: "Selesai",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Akses terbatas untuk admin</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Create New Session */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🆕 Buat Session Kelas Baru
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kelas
            </label>
            <Input
              type="date"
              value={newSession.tanggal_kelas}
              onChange={(e) =>
                setNewSession((prev) => ({
                  ...prev,
                  tanggal_kelas: e.target.value,
                }))
              }
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kapasitas
            </label>
            <Input
              type="number"
              min="15"
              max="100"
              value={newSession.kapasitas}
              onChange={(e) =>
                setNewSession((prev) => ({
                  ...prev,
                  kapasitas: parseInt(e.target.value),
                }))
              }
            />
          </div>
          <Button
            onClick={createSession}
            disabled={isCreating || !newSession.tanggal_kelas}
            className="w-full"
          >
            {isCreating ? "Membuat..." : "Buat Session"}
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            📅 Daftar Session Kelas
          </h3>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Belum ada session kelas yang dibuat
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <div key={session.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {formatDate(session.tanggal_kelas)}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>
                        Kapasitas: {session.registrations_count}/
                        {session.kapasitas}
                      </span>
                      {getStatusBadge(session.status)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {session.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateSessionStatus(session.id, "active")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Aktifkan
                      </Button>
                    )}
                    {session.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateSessionStatus(session.id, "closed")
                        }
                      >
                        Tutup
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (selectedSession === session.id) {
                          setSelectedSession(null);
                          setRegistrations([]);
                        } else {
                          setSelectedSession(session.id);
                          fetchSessionRegistrations(session.id);
                        }
                      }}
                    >
                      {selectedSession === session.id
                        ? "Tutup"
                        : "Lihat Peserta"}
                    </Button>
                    {session.status === "draft" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteSession(session.id)}
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>

                {/* Registrations Details */}
                {selectedSession === session.id && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">
                      👥 Daftar Peserta ({registrations.length})
                    </h5>
                    {registrations.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        Belum ada peserta yang mendaftar
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <th className="px-3 py-2">Nama</th>
                              <th className="px-3 py-2">NIM</th>
                              <th className="px-3 py-2">Prodi</th>
                              <th className="px-3 py-2">Semester</th>
                              <th className="px-3 py-2">Kelas</th>
                              <th className="px-3 py-2">Pembayaran</th>
                              <th className="px-3 py-2">Waktu Daftar</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {registrations.map((reg) => (
                              <tr key={reg.id} className="text-sm">
                                <td className="px-3 py-2 font-medium text-gray-900">
                                  {reg.nama_lengkap}
                                </td>
                                <td className="px-3 py-2 text-gray-700">
                                  {reg.nim}
                                </td>
                                <td className="px-3 py-2 text-gray-700">
                                  {reg.prodi}
                                </td>
                                <td className="px-3 py-2 text-gray-700">
                                  {reg.semester}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                    {reg.kelas}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  {reg.payment_verified ? (
                                    <span className="text-green-600 font-medium">
                                      ✅ Terverifikasi
                                    </span>
                                  ) : (
                                    <span className="text-yellow-600">
                                      ⏳ Menunggu
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-gray-500">
                                  {new Date(reg.created_at).toLocaleString(
                                    "id-ID"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
