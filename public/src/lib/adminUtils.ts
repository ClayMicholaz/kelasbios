/**
 * Utility functions for admin authentication
 */

import { extractNIMFromEmail } from "@/lib/nimUtils";

export function getAdminNims(): string[] {
  const adminNims = process.env.NEXT_PUBLIC_ADMIN_NIMS || "";
  return adminNims
    .split(",")
    .map((nim) => nim.trim())
    .filter((nim) => nim.length > 0);
}

export function isAdminEmail(email: string): boolean {
  const nim = extractNIMFromEmail(email);
  if (!nim) return false;

  const adminNims = getAdminNims();
  return adminNims.includes(nim);
}
