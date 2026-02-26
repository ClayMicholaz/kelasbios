"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useState } from "react";
import FilterSection from "@/components/admin/FilterSection";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import RegistrationDetailModal from "@/components/admin/RegistrationDetailModal";
import RegistrationTable from "@/components/admin/RegistrationTable";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatisticsSection from "@/components/admin/StatisticsSection";
import FormSessionManager from "@/components/admin/FormSessionManager";
import { Select } from "@/components/ui/SelectImproved";
import { DIVISI_OPTIONS } from "@/constants/divisi";

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [viewMode, setViewMode] = useState<"sessions" | "member-registrations">(
    "sessions"
  );

  const {
    loading,
    filter,
    setFilter,
    divisionFilter,
    setDivisionFilter,
    updating,
    viewingRegistration,
    setViewingRegistration,
    filteredRegistrations,
    registrations,
    stats,
    updateRegistrationStatus,
    handleTryForm,
  } = useAdminDashboard();

  const viewModeOptions = [
    { value: "sessions", label: "📋 Kelola Session (Recruitment & Kelas)" },
    {
      value: "member-registrations",
      label: "👥 Pendaftar Anggota Recruitment",
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <DashboardHeader
          onSignOut={signOut}
          onTryForm={handleTryForm}
          registrations={registrations}
          currentStatusFilter={filter}
          currentDivisionFilter={divisionFilter}
        />

        {/* View Mode Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Mode Tampilan
            </h3>
            <div className="w-80">
              <Select
                value={viewMode}
                onChange={(value: string) => setViewMode(value as any)}
                placeholder="Pilih mode tampilan"
              >
                {viewModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === "sessions" && (
          <div className="space-y-6">
            <FormSessionManager />
          </div>
        )}

        {viewMode === "member-registrations" && (
          <>
            {/* Stats */}
            <StatisticsSection stats={stats} />

            {/* Filters */}
            <FilterSection
              statusFilter={filter}
              divisionFilter={divisionFilter}
              divisionOptions={DIVISI_OPTIONS}
              onStatusFilterChange={setFilter}
              onDivisionFilterChange={setDivisionFilter}
            />

            {/* Registrations Table */}
            <div className="overflow-x-auto">
              <RegistrationTable
                registrations={filteredRegistrations}
                onUpdateStatus={updateRegistrationStatus}
                onViewDetails={setViewingRegistration}
                updating={updating}
              />
            </div>
          </>
        )}
      </div>

      {/* Registration Detail Modal */}
      {viewingRegistration && (
        <RegistrationDetailModal
          registration={viewingRegistration}
          onClose={() => setViewingRegistration(null)}
        />
      )}
    </div>
  );
}
