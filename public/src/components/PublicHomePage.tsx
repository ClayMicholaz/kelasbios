"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FormSession } from "@/types/formSession";
import { formatDate } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SessionDetailModal from "@/components/SessionDetailModal";
import { EXTERNAL_LINKS, APP_INFO } from "@/constants";

interface Registration {
  id: string;
  status: "pending" | "accepted" | "rejected";
  accepted_division?: string;
}

export default function PublicHomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [sessions, setSessions] = useState<FormSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [selectedSession, setSelectedSession] = useState<FormSession | null>(
    null
  );
  const [detailSession, setDetailSession] = useState<FormSession | null>(null);
  const [sessionRegistrationCounts, setSessionRegistrationCounts] = useState<
    Record<string, number>
  >({});
  const [userRegistrations, setUserRegistrations] = useState<{
    recruitment?: Registration;
    kelas: Record<string, Registration>;
  }>({ kelas: {} });

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
        .replace(/\.|\\d+/g, " ")
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

  useEffect(() => {
    fetchActiveSessions();
    if (user) {
      checkUserRegistrations();
    }
  }, [user]);

  useEffect(() => {
    if (sessions.length > 0) {
      fetchRegistrationCounts();
    }
  }, [sessions]);

  useEffect(() => {
    if (sessions.length > 0) {
      fetchRegistrationCounts();
    }
  }, [sessions]);

  const fetchActiveSessions = async () => {
    try {
      const now = new Date().toISOString();

      // console.log("Fetching active sessions at:", now);

      const { data, error } = await supabase
        .from("form_sessions")
        .select("*")
        .eq("status", "active")
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching sessions:", error);
        throw error;
      }

      // console.log("Raw sessions from database:", data);

      // Filter out sessions that are past their end date
      const activeSessions = (data || []).filter((session) => {
        if (!session.end_date) return true;
        const isActive = new Date(session.end_date) >= new Date();
        // console.log(
        //   `Session "${session.title}" - end_date: ${session.end_date}, isActive: ${isActive}`
        // );
        return isActive;
      });

      setSessions(activeSessions);
      // console.log("Active sessions to display:", activeSessions);
    } catch (error) {
      // console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRegistrations = async () => {
    if (!user) return;

    try {
      // Check recruitment registration
      const { data: recruitmentData } = await supabase
        .from("registrations")
        .select("id, status, accepted_division")
        .eq("user_id", user.id)
        .maybeSingle();

      // Check kelas registrations
      const { data: kelasData } = await supabase
        .from("kelas_registrations")
        .select("id, session_id, payment_verified")
        .eq("user_id", user.id);

      const kelasMap: Record<string, Registration> = {};
      kelasData?.forEach((reg) => {
        kelasMap[reg.session_id] = {
          id: reg.id,
          status: reg.payment_verified ? "accepted" : "pending",
        };
      });

      setUserRegistrations({
        recruitment: recruitmentData || undefined,
        kelas: kelasMap,
      });
    } catch (error) {
      console.error("Error checking registrations:", error);
    }
  };

  const fetchRegistrationCounts = async () => {
    try {
      const counts: Record<string, number> = {};

      for (const session of sessions) {
        const tableName =
          session.session_type === "recruitment"
            ? "registrations"
            : "kelas_registrations";
        const { count, error } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true })
          .eq(
            session.session_type === "recruitment"
              ? "form_session_id"
              : "session_id",
            session.id
          );

        if (error) {
          console.error(
            `Error counting registrations for session ${session.id}:`,
            error
          );
        } else {
          counts[session.id] = count || 0;
        }
      }

      setSessionRegistrationCounts(counts);
    } catch (error) {
      console.error("Error fetching registration counts:", error);
    }
  };

  const handleSessionClick = (session: FormSession) => {
    setSelectedSession(session);
  };

  const handleRegister = (session: FormSession) => {
    if (session.session_type === "recruitment") {
      router.push("/dashboard");
    } else if (session.session_type === "kelas") {
      // Redirect to kelas registration page with session ID
      router.push(`/kelas?sessionId=${session.id}`);
    }
  };

  const getSessionStatus = (session: FormSession) => {
    if (session.session_type === "recruitment") {
      return userRegistrations.recruitment;
    } else if (session.session_type === "kelas") {
      return userRegistrations.kelas[session.id];
    }
    return undefined;
  };

  const getStatusBadge = (status?: string, sessionType?: string) => {
    if (!status) return null;

    if (sessionType === "kelas" && status === "pending") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⏳ Menunggu Verifikasi
        </span>
      );
    }

    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pending
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Diterima
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const getSessionIcon = (sessionType: string) => {
    if (sessionType === "recruitment") {
      return "👥";
    } else if (sessionType === "kelas") {
      return "📚";
    }
    return "📋";
  };

  const getSessionTitle = (session: FormSession) => {
    if (session.session_type === "recruitment") {
      return "Pendaftaran Anggota BIOS";
    } else if (session.session_type === "kelas") {
      return session.title || "Kelas";
    }
    return session.title || "Form";
  };

  const getSessionDescription = (session: FormSession) => {
    if (session.session_type === "recruitment") {
      return "Bergabunglah dengan komunitas mahasiswa yang passionate di bidang IT!";
    } else if (session.session_type === "kelas") {
      return (
        session.description || "Daftar kelas untuk meningkatkan skill kamu"
      );
    }
    return session.description || "";
  };

  const isSessionFull = (session: FormSession) => {
    if (!session.kapasitas) return false;
    const registrationCount = sessionRegistrationCounts[session.id] || 0;
    return registrationCount >= session.kapasitas;
  };

  const handleLogin = async () => {
    try {
      setLoggingIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoggingIn(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                BIOS UBM
              </h1>
            </div>
            {user && (
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-600">Halo,</p>
                <p className="font-semibold text-sm sm:text-base text-gray-900">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!user ? (
          // Not logged in - Show login prompt
          <div className="text-center py-8 sm:py-16">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Selamat Datang!
              </h2>
              <p className="text-gray-600 mb-6">
                Login dengan akun Google UBM untuk melihat dan mendaftar
                kegiatan yang tersedia
              </p>
              <button
                onClick={handleLogin}
                disabled={loggingIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loggingIn ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Login dengan Google UBM"
                )}
              </button>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          // No active sessions
          <div className="text-center py-8 sm:py-16">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Belum Ada Kegiatan
              </h2>
              <p className="text-gray-600">
                Saat ini belum ada pendaftaran atau kegiatan yang tersedia.
                Silakan cek kembali nanti!
              </p>
            </div>
          </div>
        ) : (
          // Show active sessions
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Kegiatan & Pendaftaran Tersedia
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sessions.map((session) => {
                const registration = getSessionStatus(session);
                const isFull = isSessionFull(session);

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden"
                  >
                    {/* Thumbnail Image */}
                    {session.thumbnail_url ? (
                      <div className="relative h-48 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={session.thumbnail_url}
                          alt={session.title || "Session thumbnail"}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            // Hide image if failed to load
                            e.currentTarget.style.display = "none";
                            // Show fallback gradient background
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.className =
                                "relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center";
                              e.currentTarget.parentElement.innerHTML =
                                '<div class="text-white text-6xl opacity-80">' +
                                (session.session_type === "kelas"
                                  ? "📚"
                                  : "👥") +
                                "</div>";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        {/* Session type badge on thumbnail */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              session.session_type === "kelas"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {session.session_type === "kelas"
                              ? "📚 Kelas"
                              : "👥 Recruitment"}
                          </span>
                        </div>
                        {registration && (
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(
                              registration.status,
                              session.session_type
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback gradient background when no thumbnail
                      <div
                        className={`relative h-48 overflow-hidden flex items-center justify-center ${
                          session.session_type === "kelas"
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gradient-to-br from-purple-500 to-pink-600"
                        }`}
                      >
                        <div className="text-white text-6xl opacity-80">
                          {getSessionIcon(session.session_type)}
                        </div>
                        {/* Session type badge on gradient */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                            {session.session_type === "kelas"
                              ? "📚 Kelas"
                              : "👥 Recruitment"}
                          </span>
                        </div>
                        {registration && (
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(
                              registration.status,
                              session.session_type
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4 sm:p-6">
                      {/* Title - closer to top since we have thumbnail now */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {getSessionTitle(session)}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {getSessionDescription(session)}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        {session.tanggal_kelas && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {formatDate(session.tanggal_kelas)}
                          </div>
                        )}
                        {session.kapasitas && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            Kapasitas: {session.kapasitas} orang
                          </div>
                        )}
                        {session.end_date && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Sampai {formatDate(session.end_date)}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => setDetailSession(session)}
                          className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          👁️ Lihat Detail
                        </button>
                        <button
                          onClick={() => handleSessionClick(session)}
                          disabled={
                            isFull || registration?.status === "accepted"
                          }
                          className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                            isFull
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : registration?.status === "accepted"
                              ? "bg-green-100 text-green-800 cursor-not-allowed"
                              : registration
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isFull
                            ? "Penuh"
                            : registration?.status === "accepted"
                            ? "Sudah Terdaftar"
                            : registration
                            ? "Lihat Status"
                            : "Daftar Sekarang"}
                        </button>
                      </div>
                    </div>

                    {/* Registration Info */}
                    {registration?.accepted_division && (
                      <div className="bg-green-50 border-t border-green-100 px-6 py-3">
                        <p className="text-sm text-green-800">
                          Diterima di divisi:{" "}
                          <span className="font-semibold">
                            {registration.accepted_division}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 border-b border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Organization Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">BIOS UBM</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-400">
                    <span className="w-4 h-4 mr-3">📍</span>
                    <span>Universitas Bunda Mulia, Jakarta</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-medium mb-4">Navigasi</h4>
                <nav className="space-y-2">
                  <a
                    href="/dashboard"
                    className="block text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/kelas"
                    className="block text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Pendaftaran Kelas
                  </a>
                  <a
                    href={EXTERNAL_LINKS.BIOS_WEBSITE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Website HIMABIOS
                  </a>
                </nav>
              </div>

              {/* External Links */}
              <div>
                <h4 className="font-medium mb-4">Lainnya</h4>
                <nav className="space-y-2">
                  <a
                    href={EXTERNAL_LINKS.BIOS_FEST}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    BIOS Festival
                  </a>
                  <a
                    href={EXTERNAL_LINKS.INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href={EXTERNAL_LINKS.GITHUB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    GitHub
                  </a>
                </nav>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 BIOS UBM. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onRegister={() => handleRegister(selectedSession)}
          userRegistered={
            getSessionStatus(selectedSession)?.status === "accepted" ||
            getSessionStatus(selectedSession)?.status === "pending"
          }
          registrationCount={sessionRegistrationCounts[selectedSession.id] || 0}
        />
      )}

      {/* Detail View Modal */}
      {detailSession && (
        <SessionDetailModal
          session={detailSession}
          onClose={() => setDetailSession(null)}
          registrationCount={sessionRegistrationCounts[detailSession.id] || 0}
        />
      )}
    </div>
  );
}
