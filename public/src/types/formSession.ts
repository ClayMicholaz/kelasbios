export interface FormSession {
  id: string;
  title: string;
  description?: string;
  session_type: "recruitment" | "kelas";
  status: "draft" | "active" | "closed";
  start_date?: string;
  end_date?: string;
  kelas_id?: string;
  kapasitas?: number;
  tanggal_kelas?: string;
  harga?: number;
  ruangan?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface FormSessionInput {
  session_type: "recruitment" | "kelas";
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  capacity?: number;
}

// Extended interface for kelas sessions with computed properties
export interface KelasFormSession extends FormSession {
  // Computed properties for backwards compatibility
  status: "active" | "closed" | "draft";
  kapasitas: number; // alias for capacity
  tanggal_kelas: string; // alias for start_time
}
