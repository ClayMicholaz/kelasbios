import { Registration } from "@/types/registration";
import { formatDateTime } from "./dateUtils";

export interface CSVExportOptions {
  includeStatus?: string[]; // Filter by status
  includeDivision?: string; // Filter by division
  filename?: string;
}

// Function to convert data to CSV format
export function convertToCSV(
  data: Registration[],
  options: CSVExportOptions = {}
): string {
  if (data.length === 0) {
    return "";
  }

  // Filter data based on options
  let filteredData = data;

  if (options.includeStatus && options.includeStatus.length > 0) {
    filteredData = filteredData.filter((item) =>
      options.includeStatus!.includes(item.status)
    );
  }

  if (options.includeDivision && options.includeDivision !== "all") {
    filteredData = filteredData.filter(
      (item) => item.divisi_pertama === options.includeDivision
    );
  }

  // Define CSV headers with Indonesian labels
  const headers = [
    "No",
    "NIM",
    "Nama Lengkap",
    "Email",
    "No. HP",
    "Link Portofolio",
    "Pilihan Divisi 1",
    "Pilihan Divisi 2",
    "Pilihan Divisi 3",
    "Status",
    "Divisi Diterima",
    "Tanggal Daftar",
    "Terakhir Update",
  ];

  // Convert data to CSV rows
  const csvRows = filteredData.map((item, index) => [
    (index + 1).toString(), // Row number
    item.nim,
    item.nama,
    item.user_email || "",
    item.no_hp,
    item.link_portofolio || "",
    item.divisi_pertama,
    item.divisi_kedua,
    getStatusLabel(item.status),
    item.accepted_division || "",
    formatDateTime(item.created_at),
    formatDateTime(item.updated_at),
  ]);

  // Combine headers and rows
  const allRows = [headers, ...csvRows];

  // Convert to CSV string
  return allRows
    .map((row) =>
      row
        .map((field) => {
          // Escape fields that contain commas, quotes, or newlines
          if (
            field.includes(",") ||
            field.includes('"') ||
            field.includes("\n")
          ) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        })
        .join(",")
    )
    .join("\n");
}

// Function to download CSV file
export function downloadCSV(
  csvContent: string,
  filename: string = "registrations.csv"
): void {
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

// Function to export registrations to CSV
export function exportRegistrationsToCSV(
  registrations: Registration[],
  options: CSVExportOptions = {},
  onSuccess?: (message: string) => void
): void {
  try {
    const csvContent = convertToCSV(registrations, options);

    if (!csvContent) {
      console.error("No data to export");
    }

    let filename = "daftar-pendaftar-bios";

    if (options.includeStatus && options.includeStatus.length === 1) {
      filename += `-${options.includeStatus[0]}`;
    }

    if (options.includeDivision && options.includeDivision !== "all") {
      filename += `-${options.includeDivision
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
    }

    const currentDate = new Date().toISOString().split("T")[0];
    filename += `-${currentDate}.csv`;

    downloadCSV(csvContent, filename);

    // Show success message
    const filteredCount =
      convertToCSV(registrations, options).split("\n").length - 1;
    onSuccess?.(
      `Berhasil mengexport ${filteredCount} data pendaftar ke file ${filename}`
    );
  } catch (error) {
    console.error("Error exporting CSV:", error);
  }
}

// Helper function to get readable status label
function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "accepted":
      return "Diterima";
    case "rejected":
      return "Ditolak";
    default:
      return status;
  }
}

// Function to get statistics for export
export function getExportStatistics(
  data: Registration[],
  options: CSVExportOptions = {}
): {
  total: number;
  filtered: number;
  statusBreakdown: Record<string, number>;
} {
  let filteredData = data;

  if (options.includeStatus && options.includeStatus.length > 0) {
    filteredData = filteredData.filter((item) =>
      options.includeStatus!.includes(item.status)
    );
  }

  if (options.includeDivision && options.includeDivision !== "all") {
    filteredData = filteredData.filter(
      (item) => item.divisi_pertama === options.includeDivision
    );
  }

  const statusBreakdown = filteredData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: data.length,
    filtered: filteredData.length,
    statusBreakdown,
  };
}
