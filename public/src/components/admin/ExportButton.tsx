"use client";

import { useState, useEffect } from "react";
import { Registration } from "@/types/registration";
import { exportRegistrationsToCSV, getExportStatistics } from "@/lib/csvUtils";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

interface ExportButtonProps {
  registrations: Registration[];
  currentStatusFilter: string;
  currentDivisionFilter: string;
  className?: string;
}

export default function ExportButton({
  registrations,
  currentStatusFilter,
  currentDivisionFilter,
  className = "",
}: ExportButtonProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    statusFilter: "all",
    divisionFilter: "all",
  });

  const { addToast } = useToast();

  const handleExport = () => {
    const options = {
      includeStatus:
        exportOptions.statusFilter === "all"
          ? undefined
          : [exportOptions.statusFilter],
      includeDivision:
        exportOptions.divisionFilter === "all"
          ? undefined
          : exportOptions.divisionFilter,
    };

    exportRegistrationsToCSV(registrations, options, (message) =>
      addToast(message, "success")
    );
    setShowExportModal(false);
  };

  const handleQuickExport = () => {
    // Quick export with current filters
    const options = {
      includeStatus:
        currentStatusFilter === "all" ? undefined : [currentStatusFilter],
      includeDivision:
        currentDivisionFilter === "all" ? undefined : currentDivisionFilter,
    };

    exportRegistrationsToCSV(registrations, options, (message) =>
      addToast(message, "success")
    );
  };

  const getPreviewStats = () => {
    const options = {
      includeStatus:
        exportOptions.statusFilter === "all"
          ? undefined
          : [exportOptions.statusFilter],
      includeDivision:
        exportOptions.divisionFilter === "all"
          ? undefined
          : exportOptions.divisionFilter,
    };

    return getExportStatistics(registrations, options);
  };

  const stats = getPreviewStats();

  // Handle modal close with escape key and body scroll lock
  useEffect(() => {
    if (!showExportModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowExportModal(false);
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
  }, [showExportModal]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowExportModal(false);
    }
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        {/* Quick Export Button */}
        <Button
          onClick={handleQuickExport}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </Button>

        {/* Advanced Export Button */}
        <Button
          onClick={() => setShowExportModal(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Export Options
        </Button>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transform transition-all duration-200 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Export Data Pendaftar
                  </h3>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
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

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    Filter Status
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={exportOptions.statusFilter}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        statusFilter: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 hover:border-blue-300 transition-all duration-200 appearance-none text-gray-800 font-medium shadow-sm"
                  >
                    <option
                      value="all"
                      className="bg-blue-50 text-blue-900 py-2"
                    >
                      🔄 Semua Status
                    </option>
                    <option
                      value="pending"
                      className="bg-yellow-50 text-yellow-900 py-2"
                    >
                      ⏳ Menunggu
                    </option>
                    <option
                      value="accepted"
                      className="bg-green-50 text-green-900 py-2"
                    >
                      ✅ Diterima
                    </option>
                    <option
                      value="rejected"
                      className="bg-red-50 text-red-900 py-2"
                    >
                      ❌ Ditolak
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Division Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Filter Divisi (Pilihan Pertama)
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={exportOptions.divisionFilter}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        divisionFilter: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-gradient-to-r from-white to-green-50 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 hover:border-green-300 transition-all duration-200 appearance-none text-gray-800 font-medium shadow-sm"
                  >
                    <option
                      value="all"
                      className="bg-green-50 text-green-900 py-2"
                    >
                      🏢 Semua Divisi
                    </option>
                    <option
                      value="Acara"
                      className="bg-purple-50 text-purple-900 py-2"
                    >
                      🎉 Acara
                    </option>
                    <option
                      value="Public Relation"
                      className="bg-pink-50 text-pink-900 py-2"
                    >
                      📢 Public Relation
                    </option>
                    <option
                      value="Creative and Design"
                      className="bg-orange-50 text-orange-900 py-2"
                    >
                      🎨 Creative and Design
                    </option>
                    <option
                      value="Development and Project"
                      className="bg-blue-50 text-blue-900 py-2"
                    >
                      💻 Development and Project
                    </option>
                    <option
                      value="Publikasi dan Dokumentasi"
                      className="bg-indigo-50 text-indigo-900 py-2"
                    >
                      📚 Publikasi dan Dokumentasi
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Preview Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"
                    />
                  </svg>
                  <p className="font-semibold text-blue-900">
                    Preview Data Export
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-sm text-gray-700 mb-2">
                    📊{" "}
                    <span className="font-semibold text-blue-600">
                      {stats.filtered}
                    </span>{" "}
                    dari <span className="font-semibold">{stats.total}</span>{" "}
                    pendaftar akan diekspor
                  </p>
                  {Object.keys(stats.statusBreakdown).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(stats.statusBreakdown).map(
                        ([status, count]) => (
                          <span
                            key={status}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {status === "pending"
                              ? "⏳"
                              : status === "accepted"
                              ? "✅"
                              : "❌"}{" "}
                            {status === "pending"
                              ? "Menunggu"
                              : status === "accepted"
                              ? "Diterima"
                              : "Ditolak"}
                            : {count}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleExport}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                  disabled={stats.filtered === 0}
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3"
                    />
                  </svg>
                  Export CSV ({stats.filtered} data)
                </Button>
                <Button
                  onClick={() => setShowExportModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-all duration-200"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
