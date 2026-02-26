"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { getActiveSessions } from "@/lib/sessionUtils";
import { useSearchParams } from "next/navigation";
import KelasRegistrationForm from "@/components/KelasRegistrationForm";
import LoginPage from "@/components/LoginPage";
import { FormSession } from "@/types/formSession";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";

function KelasContent() {
  const { user, loading, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const adminView = searchParams.get("admin") === "true";
  const sessionId = searchParams.get("sessionId");
  const [activeSession, setActiveSession] = useState<FormSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    fetchActiveSession();

    // Auto-refresh setiap 30 detik untuk cek session status
    const interval = setInterval(fetchActiveSession, 30000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchActiveSession = async () => {
    try {
      if (sessionId) {
        // Fetch specific session by ID
        const { data: session, error } = await supabase
          .from("form_sessions")
          .select("*")
          .eq("id", sessionId)
          .eq("session_type", "kelas")
          .single();

        if (error) {
          console.error("Error fetching session:", error);
          setActiveSession(null);
        } else {
          setActiveSession(session);
        }
      } else {
        // Fetch active session (original behavior)
        const sessions = await getActiveSessions();
        setActiveSession(sessions.kelas);
      }
    } catch (error) {
      console.error("Error fetching active session:", error);
      setActiveSession(null);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleRegistrationSuccess = () => {
    // Refresh session data after successful registration
    fetchActiveSession();
  };

  const handleSessionCreated = () => {
    // Refresh session data after admin creates new session
    fetchActiveSession();
  };

  if (loading || loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Admin view - redirect to main admin dashboard
  if (isAdmin && adminView) {
    // Redirect admin to main dashboard instead
    if (typeof window !== "undefined") {
      window.location.href = "/admin";
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Regular user view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            📚 Kelas BIOS
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Kelas mingguan untuk belajar bersama komunitas BIOS
          </p>
        </div>

        {/* Navigation for admin */}
        {isAdmin && (
          <div className="mb-6 text-center">
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              🔧 Admin Dashboard - Kelola Session Kelas
            </a>
          </div>
        )}

        {/* Registration Form or Info */}
        {activeSession ? (
          <KelasRegistrationForm
            session={activeSession}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        ) : (
          <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="mb-4 sm:mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  📅
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Belum Ada Kelas Aktif
              </h2>
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                <p className="text-gray-700 mb-2">
                  🕐 <strong>Jadwal Pendaftaran:</strong> Setiap hari Jumat
                </p>
                <p className="text-gray-700 mb-2">
                  📚 <strong>Jadwal Kelas:</strong> Setiap hari Sabtu
                </p>
                <p className="text-gray-700 mb-2">
                  ⏰ <strong>Batas Pendaftaran:</strong> Sabtu jam 06:00
                </p>
                <p className="text-gray-700">
                  👥 <strong>Kapasitas:</strong> Minimal 15 peserta
                </p>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Pendaftaran akan dibuka setiap hari Jumat oleh admin. Pantau
                  terus halaman ini untuk informasi terbaru!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">⏰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Sistem Berebut</h3>
            <p className="text-gray-600 text-sm">
              Pendaftaran dibuka terbatas dengan sistem first-come-first-served
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Kapasitas Terbatas
            </h3>
            <p className="text-gray-600 text-sm">
              Setiap kelas minimal 15 peserta, maksimal sesuai kapasitas yang
              ditentukan
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Anggota Prioritas
            </h3>
            <p className="text-gray-600 text-sm">
              Anggota BIOS dapat mencantumkan divisi untuk mendapat materi
              sesuai bidang
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function KelasPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KelasContent />
    </Suspense>
  );
}
