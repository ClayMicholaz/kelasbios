"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const getUser = async () => {
      console.log("[Navbar] Starting to fetch user...");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("[Navbar] Session:", session?.user?.email);

        if (!isMounted) return;

        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          console.log("[Navbar] Fetching profile for:", user.id);
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          console.log("[Navbar] Profile data:", profileData);
          console.log("[Navbar] Profile error:", profileError);

          if (isMounted) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("[Navbar] Error loading user:", error);
      } finally {
        if (isMounted) {
          console.log("[Navbar] Setting loading to false");
          setLoading(false);
        }
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[Navbar] Auth state changed:", _event, session?.user?.email);
      if (!isMounted) return;

      try {
        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          console.log("[Navbar] Auth change - Fetching profile for:", user.id);
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          console.log("[Navbar] Auth change - Profile data:", data);
          console.log("[Navbar] Auth change - Profile error:", error);

          if (isMounted) {
            setProfile(data);
          }
        } else {
          if (isMounted) {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error("[Navbar] Error in auth state change:", error);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
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

                  {profile?.role === "admin" && (
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
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent-bright/40 group-hover:ring-accent-bright transition-all">
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt={profile?.full_name || "Profile"}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-lg">
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
                      {profile?.role === "admin" && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-xs font-semibold rounded">
                          Admin
                        </span>
                      )}
                    </div>

                    {profile?.role === "admin" ? (
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
                className="px-5 py-2.5 bg-gradient-to-r from-accent-bright to-accent-500 text-primary-950 rounded-lg hover:from-accent-400 hover:to-accent-600 transition-all duration-200 text-sm font-bold"
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
