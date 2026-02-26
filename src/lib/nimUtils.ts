/**
 * Utility functions for extracting and validating NIM from UBM email addresses
 * Adapted from DaftarBIOS
 */

/**
 * Extracts NIM from UBM email address
 * @param email - UBM email address (e.g., s32230130@student.ubm.ac.id)
 * @returns NIM string or null if not found
 */
export function extractNIMFromEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  // UBM student email pattern: s32230130@student.ubm.ac.id
  const studentEmailRegex = /^s(\d{8})@student\.ubm\.ac\.id$/i;
  const studentMatch = email.match(studentEmailRegex);

  if (studentMatch && studentMatch[1]) {
    return studentMatch[1];
  }

  // Check if it's a staff/faculty email
  const staffEmailRegex = /^[a-zA-Z]+\.?[a-zA-Z]*@ubm\.ac\.id$/i;
  if (staffEmailRegex.test(email)) {
    // For staff emails, we can't extract NIM automatically
    return null;
  }

  // If email doesn't match UBM patterns, return null
  return null;
}

/**
 * Validates if a NIM is in correct format (8 digits)
 * @param nim - NIM string to validate
 * @returns boolean indicating if NIM is valid
 */
export function validateNIM(nim: string): boolean {
  if (!nim || typeof nim !== "string") {
    return false;
  }

  // NIM should be exactly 8 digits
  const nimRegex = /^\d{8}$/;
  return nimRegex.test(nim.trim());
}

/**
 * Formats NIM by removing any non-digit characters and ensuring 8 digits
 * @param nim - Raw NIM input
 * @returns Formatted NIM or null if invalid
 */
export function formatNIM(nim: string): string | null {
  if (!nim || typeof nim !== "string") {
    return null;
  }

  // Remove all non-digit characters
  const digits = nim.replace(/\D/g, "");

  // Check if we have exactly 8 digits
  if (digits.length === 8) {
    return digits;
  }

  return null;
}

/**
 * Determines user type based on email
 * @param email - User's email address
 * @returns 'student' | 'staff' | 'unknown'
 */
export function getUserType(email: string): "student" | "staff" | "unknown" {
  if (!email || typeof email !== "string") {
    return "unknown";
  }

  // Student email pattern
  if (/^s\d{8}@student\.ubm\.ac\.id$/i.test(email)) {
    return "student";
  }

  // Staff/faculty email pattern
  if (/^[a-zA-Z]+\.?[a-zA-Z]*@ubm\.ac\.id$/i.test(email)) {
    return "staff";
  }

  return "unknown";
}

/**
 * Gets the display name for user based on email
 * @param email - User's email address
 * @returns string for display purposes
 */
export function getDisplayNameFromEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "User";
  }

  // Extract username part before @
  const username = email.split("@")[0];

  // Remove 's' prefix for student emails
  if (username.startsWith("s") && /^\d{8}$/.test(username.substring(1))) {
    return `Student ${username.substring(1)}`;
  }

  // For staff emails, capitalize and format
  return username
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
