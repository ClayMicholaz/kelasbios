"use client";

import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/AdminDashboard";
import LoginPage from "@/components/LoginPage";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki akses ke halaman admin.
          </p>
          <p className="text-sm text-gray-500">
            Hanya NIM yang terdaftar sebagai admin yang dapat mengakses halaman
            ini.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
