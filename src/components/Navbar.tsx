"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (isMounted) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (isMounted) {
          setProfile(data);
        }
      } else {
        if (isMounted) {
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
              <div className="h-10 w-28 bg-primary-700/50 animate-pulse rounded-lg"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-200 hidden sm:block font-medium">
                  {profile?.full_name || user.email}
                </span>
                <Link
                  href="/auth/logout"
                  className="px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-medium"
                >
                  Keluar
                </Link>
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
