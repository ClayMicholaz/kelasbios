import { Button } from "@/components/ui/Button";
import ExportButton from "./ExportButton";
import { Registration } from "@/types/registration";

interface DashboardHeaderProps {
  onSignOut: () => void;
  onTryForm: () => void;
  registrations: Registration[];
  currentStatusFilter: string;
  currentDivisionFilter: string;
}

export default function DashboardHeader({
  onSignOut,
  onTryForm,
  registrations,
  currentStatusFilter,
  currentDivisionFilter,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Kelola pendaftaran Open Recruitment BIOS
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <ExportButton
            registrations={registrations}
            currentStatusFilter={currentStatusFilter}
            currentDivisionFilter={currentDivisionFilter}
          />
          <Button
            onClick={() => window.open("/admin/sessions", "_blank")}
            variant="outline"
            size="sm"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            ⚙️ Kelola Form Session
          </Button>
          <Button
            onClick={() => window.open("/kelas?admin=true", "_blank")}
            variant="outline"
            size="sm"
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            📚 Kelola Kelas
          </Button>
          <Button
            onClick={onTryForm}
            variant="outline"
            size="sm"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            Coba Form
          </Button>
          <Button onClick={onSignOut} variant="danger" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
