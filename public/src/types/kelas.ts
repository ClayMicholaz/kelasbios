export interface KelasSession {
  id: string;
  tanggal_kelas: string;
  kapasitas: number;
  status: "draft" | "active" | "closed" | "completed";
  created_at: string;
  updated_at: string;
  created_by: string | null;
  registrations_count?: number;
}

export interface KelasRegistration {
  id: string;
  session_id: string;
  user_id: string;
  nama_lengkap: string;
  nim: string;
  prodi: string;
  semester: number;
  kelas: "1PTI1" | "1PTI2" | "1PTI3";
  bukti_pembayaran?: string;
  terms_accepted: boolean;
  payment_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface KelasSessionWithRegistrations extends KelasSession {
  registrations: KelasRegistration[];
}
