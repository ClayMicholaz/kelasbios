/**
 * Utility functions for file operations
 */

/**
 * Clean a string to be safe for use as filename
 * Removes special characters except underscore and replaces spaces with underscore
 */
export function cleanFileName(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters except spaces
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .trim();
}

/**
 * Generate filename using NIM and Nama format
 * Format: {cleanNIM}_{cleanNama}.{extension}
 */
export function generateFileNameFromData(
  nim: string,
  nama: string,
  extension: string,
  addTimestamp: boolean = false
): string {
  const cleanNim = cleanFileName(nim);
  const cleanNama = cleanFileName(nama);

  let filename = `${cleanNim}_${cleanNama}`;

  if (addTimestamp) {
    filename += `_${Date.now()}`;
  }

  return `${filename}.${extension}`;
}

/**
 * Generate fallback filename using user ID
 */
export function generateFallbackFileName(
  userId: string,
  extension: string
): string {
  return `${userId}-${Date.now()}.${extension}`;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop() || "";
}

/**
 * Validate if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Validate file size (in MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Get file size in readable format
 */
export function getReadableFileSize(sizeInBytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = sizeInBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
