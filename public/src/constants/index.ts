/**
 * Application constants for maintainability
 */

// External Links
export const EXTERNAL_LINKS = {
  BIOS_WEBSITE: "https://himabios.vercel.app",
  BIOS_FEST: "https://biosfest.vercel.app",
  INSTAGRAM: "https://instagram.com/ubm_bios_ancol",
  GITHUB: "https://github.com/bios-bunda-mulia-university",
} as const;

// Bank Information
export const BANK_ACCOUNT = {
  bank: "Jago",
  accountNumber: "100271468145",
  accountName: "Christopher Haris",
} as const;

// Application Information
export const APP_INFO = {
  name: "BIOS UBM",
  description:
    "Organisasi mahasiswa Informatika Universitas Bunda Mulia yang berfokus pada pengembangan teknologi, kreativitas, dan keterampilan mahasiswa di bidang IT.",
  version: "1.0.0",
} as const;

// Class Options
export const KELAS_OPTIONS = [
  { value: "1PTI1", label: "1PTI1" },
  { value: "1PTI2", label: "1PTI2" },
  { value: "1PTI3", label: "1PTI3" },
] as const;

// Division Options
export const DIVISI_OPTIONS = [
  "Acara",
  "Public Relation",
  "Creative and Design",
  "Development and Project",
  "Publikasi dan Dokumentasi",
] as const;

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/jpg"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png"],
} as const;

// Validation Rules
export const VALIDATION = {
  NIM_LENGTH: 8,
  MIN_PRICE: 15000,
  DEFAULT_CAPACITY: 15,
} as const;
