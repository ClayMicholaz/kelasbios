import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, isSupabaseConfigured } from "./supabase-config";

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

// Configure Supabase client with proper options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      registrations: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          nim: string;
          nama: string;
          no_hp: string;
          foto_diri: string;
          link_portofolio?: string;
          divisi_pertama: string;
          divisi_kedua: string;
          status?: "pending" | "accepted" | "rejected";
          accepted_division?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nim?: string;
          nama?: string;
          no_hp?: string;
          foto_diri?: string;
          link_portofolio?: string;
          divisi_pertama?: string;
          divisi_kedua?: string;
          status?: "pending" | "accepted" | "rejected";
          accepted_division?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
