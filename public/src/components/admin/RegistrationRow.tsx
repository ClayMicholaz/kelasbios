import { useState } from "react";
import { Button } from "@/components/ui/Button";
import StatusBadge from "./StatusBadge";
import { Select } from "@/components/ui/SelectImproved";
import { Registration } from "@/types/registration";

interface RegistrationRowProps {
  registration: Registration;
  onUpdateStatus: (
    id: string,
    status: "pending" | "accepted" | "rejected",
    division?: string
  ) => void;
  onViewDetails: (registration: Registration) => void;
  isUpdating: boolean;
}

export default function RegistrationRow({
  registration,
  onUpdateStatus,
  onViewDetails,
  isUpdating,
}: RegistrationRowProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>(
    registration.accepted_division || registration.divisi_pertama
  );

  const uniqueDivisions = Array.from(
    new Set([registration.divisi_pertama, registration.divisi_kedua])
  );

  return (
    <tr>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
            src={registration.foto_diri}
            alt="Foto"
          />
          <div className="ml-2 sm:ml-4">
            <div className="text-xs sm:text-sm font-medium text-gray-900">
              {registration.nama}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              NIM: {registration.nim}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {registration.user_email}
            </div>
            <div className="text-sm text-gray-500">{registration.no_hp}</div>
          </div>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm text-gray-900">
          <div className="flex items-center">
            <span className="text-blue-600 font-medium mr-1">1.</span>
            <span>{registration.divisi_pertama}</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-medium mr-1">2.</span>
            <span>{registration.divisi_kedua || "—"}</span>
          </div>
          {registration.accepted_division && (
            <div className="text-green-600 font-semibold mt-2 p-2 bg-green-50 rounded-md">
              ✅ Diterima di: {registration.accepted_division}
            </div>
          )}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <StatusBadge status={registration.status} size="sm" />
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
        <div className="space-y-2">
          <Button
            onClick={() => onViewDetails(registration)}
            variant="outline"
            size="sm"
            className="w-full mb-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Lihat Detail
          </Button>

          {registration.status === "pending" && (
            <>
              <div className="mb-2">
                <Select
                  variant="compact"
                  placeholder="📋 Pilih divisi untuk diterima"
                  value={selectedDivision}
                  onChange={setSelectedDivision}
                >
                  {uniqueDivisions.map((divisi) => {
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
              <div className="flex space-x-2">
                <Button
                  onClick={() =>
                    onUpdateStatus(
                      registration.id,
                      "accepted",
                      selectedDivision
                    )
                  }
                  disabled={isUpdating || !selectedDivision}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white border-emerald-600"
                >
                  {isUpdating ? "Loading..." : "Terima"}
                </Button>
                <Button
                  onClick={() => onUpdateStatus(registration.id, "rejected")}
                  disabled={isUpdating}
                  variant="danger"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
                >
                  {isUpdating ? "Loading..." : "Tolak"}
                </Button>
              </div>
            </>
          )}

          {registration.status !== "pending" && (
            <Button
              onClick={() => onUpdateStatus(registration.id, "pending")}
              disabled={isUpdating}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {isUpdating ? "Loading..." : "Reset ke Pending"}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
