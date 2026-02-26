import { Button } from "@/components/ui/Button";
import StatusBadge from "./StatusBadge";
import { Registration } from "@/types/registration";
import { useEffect } from "react";

interface RegistrationDetailModalProps {
  registration: Registration;
  onClose: () => void;
}

export default function RegistrationDetailModal({
  registration,
  onClose,
}: RegistrationDetailModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Lock body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Restore body scroll
      document.body.style.overflow = originalStyle;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(2px)",
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Detail Pendaftaran
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </Button>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Tutup modal"
              >
                <svg
                  className="w-6 h-6 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Foto dan Info Dasar */}
            <div className="flex items-start space-x-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="h-24 w-24 rounded-lg object-cover"
                src={registration.foto_diri}
                alt="Foto Pendaftar"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {registration.nama}
                </h3>
                <p className="text-gray-600">NIM: {registration.nim}</p>
                <p className="text-gray-600">
                  Email: {registration.user_email}
                </p>
                <p className="text-gray-600">No. HP: {registration.no_hp}</p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Status Pendaftaran
              </h4>
              <div className="flex items-center space-x-2">
                <StatusBadge status={registration.status} />
                {registration.accepted_division && (
                  <span className="ml-2 text-sm text-emerald-600 font-semibold">
                    di {registration.accepted_division}
                  </span>
                )}
              </div>
            </div>

            {/* Pilihan Divisi */}
            <div className="bg-blue-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Pilihan Divisi
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Pilihan 1:</span>{" "}
                  {registration.divisi_pertama}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Pilihan 2:</span>{" "}
                  {registration.divisi_kedua}
                </p>
              </div>
            </div>

            {/* Link Portofolio */}
            {registration.link_portofolio && (
              <div className="bg-purple-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Portofolio</h4>
                <a
                  href={registration.link_portofolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                >
                  {registration.link_portofolio}
                </a>
              </div>
            )}

            {/* Tanggal Pendaftaran */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Informasi Pendaftaran
              </h4>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Tanggal Daftar:</span>{" "}
                {new Date(registration.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {registration.updated_at !== registration.created_at && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Terakhir Update:</span>{" "}
                  {new Date(registration.updated_at).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
