"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import PublicHomePage from "@/components/PublicHomePage";
import LoginPage from "@/components/LoginPage";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";

function DashboardContent() {
  const { user, loading, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const [authTimeout, setAuthTimeout] = useState(false);

  // Set a timeout for auth loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        // console.log("Auth loading timeout, showing login page");
        setAuthTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Show loading state
  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show admin dashboard if user is admin
  if (isAdmin && user) {
    return <AdminDashboard />;
  }

  // Show public home page for regular users and guests
  return <PublicHomePage />;
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

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
