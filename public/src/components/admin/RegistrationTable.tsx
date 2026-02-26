import RegistrationRow from "./RegistrationRow";
import { Registration } from "@/types/registration";

interface RegistrationTableProps {
  registrations: Registration[];
  onUpdateStatus: (
    id: string,
    status: "pending" | "accepted" | "rejected",
    division?: string
  ) => void;
  onViewDetails: (registration: Registration) => void;
  updating: string | null;
}

export default function RegistrationTable({
  registrations,
  onUpdateStatus,
  onViewDetails,
  updating,
}: RegistrationTableProps) {
  if (registrations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Pendaftar (0)
          </h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          Tidak ada data pendaftar
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Daftar Pendaftar ({registrations.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pendaftar
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pilihan Divisi
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((registration) => (
              <RegistrationRow
                key={registration.id}
                registration={registration}
                onUpdateStatus={onUpdateStatus}
                onViewDetails={onViewDetails}
                isUpdating={updating === registration.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
