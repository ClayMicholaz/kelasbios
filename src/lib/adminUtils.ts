/**
 * Utility functions for admin role checking
 * Adapted from DaftarBIOS
 */

/**
 * Check if user is admin based on database role
 * This should be called after profile is loaded
 * @param role - User's role from profiles table
 * @returns boolean indicating if user is admin
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

/**
 * Get admin emails from environment variable (fallback only)
 * Note: Primary admin check should come from database role
 * @returns Array of admin email addresses
 */
export function getAdminEmails(): string[] {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return adminEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

/**
 * Check if email is in admin list (environment variable fallback)
 * Note: This is a fallback check. Primary check should be database role.
 * @param email - User's email address
 * @returns boolean indicating if email is in admin list
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}
