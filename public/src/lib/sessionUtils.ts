import { supabase } from "./supabase";
import { FormSession, KelasFormSession } from "@/types/formSession";

export interface ActiveSessions {
  recruitment: FormSession | null;
  kelas: FormSession | null;
}

/**
 * Convert FormSession to KelasFormSession with computed properties
 */
export function toKelasFormSession(session: FormSession): KelasFormSession {
  return {
    ...session,
    status: session.status,
    kapasitas: session.kapasitas || 15,
    tanggal_kelas: session.tanggal_kelas || session.start_date || "",
  };
}

/**
 * Get currently active form sessions
 */
export async function getActiveSessions(): Promise<ActiveSessions> {
  try {
    const { data, error } = await supabase
      .from("form_sessions")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active sessions:", error);
      return { recruitment: null, kelas: null };
    }

    const recruitment =
      data?.find((session) => session.session_type === "recruitment") || null;
    const kelas =
      data?.find((session) => session.session_type === "kelas") || null;

    return { recruitment, kelas };
  } catch (error) {
    console.error("Error in getActiveSessions:", error);
    return { recruitment: null, kelas: null };
  }
}

/**
 * Check if recruitment form is currently active
 */
export async function isRecruitmentActive(): Promise<boolean> {
  const sessions = await getActiveSessions();
  return sessions.recruitment !== null;
}

/**
 * Check if kelas form is currently active
 */
export async function isKelasActive(): Promise<boolean> {
  const sessions = await getActiveSessions();
  return sessions.kelas !== null;
}

/**
 * Get current active kelas session (for capacity checking)
 */
export async function getActiveKelasSession(): Promise<FormSession | null> {
  const sessions = await getActiveSessions();
  return sessions.kelas;
}
