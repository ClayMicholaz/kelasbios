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
  // Convert to WIB (UTC+7)
  const utcDate = new Date(date);
  const wibDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
  
  return wibDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta", // WIB timezone
  });
}

export function formatDateTime(date: string): string {
  // Convert to WIB (UTC+7)
  const utcDate = new Date(date);
  const wibDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
  
  return wibDate.toLocaleString("id-ID", {
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
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTimeRemaining(deadline: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();

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
