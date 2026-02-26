import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  // Use Asia/Jakarta timezone directly (WIB = UTC+7)
  const dateObj = new Date(date);

  return dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta", // WIB timezone
  });
}

export function formatDateTime(date: string): string {
  // Use Asia/Jakarta timezone directly (WIB = UTC+7)
  const dateObj = new Date(date);

  return dateObj.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta", // WIB timezone
  });
}

export function formatTime(time: string): string {
  // time format is "HH:MM:SS"
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}

export function getDaysRemaining(deadline: string): number {
  // Get current time in WIB (Asia/Jakarta) timezone
  const now = new Date();
  const nowWIB = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );

  // Parse deadline and ensure it's in WIB timezone
  const deadlineDate = new Date(deadline);
  const deadlineWIB = new Date(
    deadlineDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );

  const diff = deadlineWIB.getTime() - nowWIB.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTimeRemaining(deadline: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  // Get current time in WIB (Asia/Jakarta) timezone
  const now = new Date();
  const nowWIB = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );

  // Parse deadline and ensure it's in WIB timezone
  const deadlineDate = new Date(deadline);
  const deadlineWIB = new Date(
    deadlineDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );

  const diff = deadlineWIB.getTime() - nowWIB.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function isValidUBMEmail(email: string): boolean {
  return email.endsWith("@student.ubm.ac.id");
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

export function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function getCountdownText(deadline: string): string {
  const timeRemaining = getTimeRemaining(deadline);

  if (
    timeRemaining.days === 0 &&
    timeRemaining.hours === 0 &&
    timeRemaining.minutes === 0 &&
    timeRemaining.seconds === 0
  ) {
    return "Sudah ditutup";
  }

  if (timeRemaining.days > 0) {
    return `Tutup dalam ${timeRemaining.days} hari`;
  }

  if (timeRemaining.hours > 0) {
    return `Tutup dalam ${timeRemaining.hours} jam`;
  }

  return "Tutup hari ini";
}

/**
 * Convert datetime-local input (WIB/Asia Jakarta timezone) to UTC ISO string
 * for storing in Supabase database
 *
 * @param datetimeLocal - String from datetime-local input (e.g., "2026-02-27T08:00")
 * @returns ISO string in UTC timezone (e.g., "2026-02-27T01:00:00.000Z")
 *
 * @example
 * // User inputs 8 AM WIB
 * convertWIBToUTC("2026-02-27T08:00")
 * // Returns: "2026-02-27T01:00:00.000Z" (1 AM UTC)
 */
export function convertWIBToUTC(datetimeLocal: string): string {
  if (!datetimeLocal) return datetimeLocal;

  // Parse the datetime-local string (assumes WIB timezone)
  // Format: "YYYY-MM-DDTHH:mm"
  const date = new Date(datetimeLocal);

  // Get UTC time from the date object
  // datetime-local is interpreted as local time by browser
  // We need to manually adjust for WIB (UTC+7)
  const wibOffset = 7 * 60; // WIB is UTC+7 in minutes
  const localOffset = date.getTimezoneOffset(); // Browser's timezone offset

  // Calculate the difference and adjust
  const offsetDiff = wibOffset + localOffset;
  date.setMinutes(date.getMinutes() - offsetDiff);

  return date.toISOString();
}

/**
 * Convert UTC timestamp to WIB datetime-local format for form input
 *
 * @param utcTimestamp - UTC timestamp string from database
 * @returns datetime-local format string (e.g., "2026-02-27T08:00")
 */
export function convertUTCToWIBLocal(utcTimestamp: string): string {
  if (!utcTimestamp) return "";

  const date = new Date(utcTimestamp);

  // WIB is UTC+7
  const wibOffset = 7 * 60; // minutes
  const wibDate = new Date(date.getTime() + wibOffset * 60 * 1000);

  // Format as datetime-local: YYYY-MM-DDTHH:mm
  const year = wibDate.getUTCFullYear();
  const month = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wibDate.getUTCDate()).padStart(2, "0");
  const hours = String(wibDate.getUTCHours()).padStart(2, "0");
  const minutes = String(wibDate.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
