"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { EXTERNAL_LINKS } from "@/constants";

export default function Navigation() {
  const { user, isAdmin, signOut } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  BIOS UBM
                </h1>
                <p className="text-xs text-gray-500">Pendaftaran Online</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <span>🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/kelas"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <span>📚</span>
              <span>Kelas</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <span>🔧</span>
                <span>Admin</span>
              </Link>
            )}

            {/* External Links */}
            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            <a
              href={EXTERNAL_LINKS.BIOS_WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <span>🌐</span>
              <span>Website BIOS</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            <a
              href={EXTERNAL_LINKS.BIOS_FEST}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <span>🎉</span>
              <span>BIOS Fest</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {user.user_metadata?.name?.charAt(0) ||
                    user.email?.charAt(0) ||
                    "U"}
                </span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {user.user_metadata?.name?.split(" ")[0] || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {isAdmin ? "Administrator" : "Member"}
                </div>
              </div>
            </div>

            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600 p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
