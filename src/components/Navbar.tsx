"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, loading, isAdmin, signOut, refreshProfile } =
    useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const forceRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Sign out
    await signOut();

    // Force reload to login
    window.location.replace("/auth/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-primary-950 shadow-md sticky top-0 z-50 border-b border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent-bright/40 group-hover:ring-accent-bright transition-all">
                <Image
                  src="/logo-bios.svg"
                  alt="BIOS UBM"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">BIOS</span>
                <span className="text-xs text-accent-bright">
                  Learning Management System
                </span>
              </div>
            </Link>

            <div className="hidden md:flex space-x-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-accent-bright/10 text-accent-bright"
                    : "text-gray-300 hover:text-white hover:bg-primary-800"
                }`}
              >
                Beranda
              </Link>

              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/dashboard")
                        ? "bg-accent-bright/20 text-accent-bright"
                        : "text-gray-200 hover:bg-primary-700/50 hover:text-white"
                    }`}
                  >
                    Dashboard
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        pathname?.startsWith("/admin")
                          ? "bg-accent-bright/20 text-accent-bright"
                          : "text-gray-200 hover:bg-primary-700/50 hover:text-white"
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-10 w-10 bg-primary-700/50 animate-pulse rounded-full"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none group"
                  aria-label="Profile menu"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent-bright/40 group-hover:ring-accent-bright transition-all">
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt={profile?.full_name || "Profile"}
                        width={40}
                        height={40}
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          console.error("[Navbar] Image load error:", e);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-lg">
                        {(profile?.full_name || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-2 px-2 py-1 bg-linear-to-r from-primary-600 to-accent-600 text-white text-xs font-semibold rounded">
                          Admin
                        </span>
                      )}
                      {/* Debug info - remove after testing */}
                      <p className="text-xs text-gray-400 mt-2">
                        Role: {profile?.role || "not set"} | NIM:{" "}
                        {profile?.nim || "not set"}
                      </p>

                      {/* Force Refresh Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          forceRefreshProfile();
                        }}
                        disabled={refreshing}
                        className="mt-2 w-full px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded transition-colors disabled:opacity-50"
                      >
                        {refreshing ? "Refreshing..." : "🔄 Refresh Profile"}
                      </button>
                    </div>

                    {isAdmin ? (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                        >
                          ⚙️ Dashboard Admin
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                        >
                          👤 Dashboard Member
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                      >
                        📊 Dashboard Saya
                      </Link>
                    )}

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🚪 Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-5 py-2.5 bg-linear-to-r from-accent-bright to-accent-500 text-primary-950 rounded-lg hover:from-accent-400 hover:to-accent-600 transition-all duration-200 text-sm font-bold"
              >
                Masuk dengan Google UBM
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
