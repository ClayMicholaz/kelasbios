"use client";

import Link from "next/link";
import { useState } from "react";

export default function PolicyCard() {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-primary-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-700 transition-all text-sm font-medium"
          aria-label="Tampilkan informasi kebijakan"
        >
          📋 Kebijakan
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            Informasi Kebijakan
          </h3>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Minimalkan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          <Link
            href="/privacy-policy"
            className="block text-xs text-primary-700 hover:text-primary-900 hover:underline font-medium"
          >
            📄 Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="block text-xs text-primary-700 hover:text-primary-900 hover:underline font-medium"
          >
            📜 Terms of Service
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Untuk verifikasi Google OAuth
        </p>
      </div>
    </div>
  );
}
