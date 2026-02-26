"use client";

import { useState } from "react";

interface SecureDownloadButtonProps {
  url: string;
  fileName: string;
}

export default function SecureDownloadButton({
  url,
  fileName,
}: SecureDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDownloading(true);
    setError(null);

    try {
      // Fetch file dari storage secara programmatic
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Gagal mengunduh file. Silakan coba lagi.");
      }

      // Convert response ke blob
      const blob = await response.blob();

      // Create temporary blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temporary anchor element untuk trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";

      // Append ke body, click, lalu hapus
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up: revoke blob URL setelah delay singkat
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Gagal mengunduh file");
    } finally {
      setDownloading(false);
    }
  };

  // Prevent context menu (klik kanan) untuk keamanan
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        onContextMenu={handleContextMenu}
        disabled={downloading}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed select-none"
        style={{ userSelect: "none" }}
      >
        {downloading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Mendownload...
          </span>
        ) : (
          "Download"
        )}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
