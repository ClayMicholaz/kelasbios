import { Select } from "@/components/ui/SelectImproved";

interface FilterSectionProps {
  statusFilter: "all" | "pending" | "accepted" | "rejected";
  divisionFilter: string;
  divisionOptions: string[];
  onStatusFilterChange: (
    status: "all" | "pending" | "accepted" | "rejected"
  ) => void;
  onDivisionFilterChange: (division: string) => void;
}

export default function FilterSection({
  statusFilter,
  divisionFilter,
  divisionOptions,
  onStatusFilterChange,
  onDivisionFilterChange,
}: FilterSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
            />
          </svg>
          Filter Data
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Saring data pendaftar berdasarkan status dan divisi pilihan
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Select
          label="Filter Status"
          value={statusFilter}
          onChange={(value) =>
            onStatusFilterChange(
              value as "all" | "pending" | "accepted" | "rejected"
            )
          }
        >
          <option value="all">🔄 Semua Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="accepted">✅ Diterima</option>
          <option value="rejected">❌ Ditolak</option>
        </Select>

        <Select
          label="Filter Divisi Pilihan 1"
          value={divisionFilter}
          onChange={onDivisionFilterChange}
        >
          <option value="all">🏢 Semua Divisi</option>
          {divisionOptions.map((divisi) => {
            const getEmoji = (divisiName: string) => {
              switch (divisiName) {
                case "Acara":
                  return "🎉";
                case "Public Relation":
                  return "📢";
                case "Creative and Design":
                  return "🎨";
                case "Development and Project":
                  return "💻";
                case "Publikasi dan Dokumentasi":
                  return "📚";
                default:
                  return "📋";
              }
            };

            return (
              <option key={divisi} value={divisi}>
                {getEmoji(divisi)} {divisi}
              </option>
            );
          })}
        </Select>
      </div>
    </div>
  );
}
