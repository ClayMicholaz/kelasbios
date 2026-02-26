export interface Registration {
  id: string;
  user_id: string;
  nim: string;
  nama: string;
  no_hp: string;
  foto_diri: string;
  link_portofolio?: string;
  divisi_pertama: string;
  divisi_kedua: string;
  status: "pending" | "accepted" | "rejected";
  accepted_division?: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
}
