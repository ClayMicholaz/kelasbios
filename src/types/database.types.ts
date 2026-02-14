export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          nim: string | null;
          role: "member" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          nim?: string | null;
          role?: "member" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          nim?: string | null;
          role?: "member" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          title: string;
          description: string;
          duration_hours: number;
          classroom: string;
          max_participants: number;
          class_date: string;
          class_time: string;
          registration_deadline: string;
          materials: Json[] | null;
          practice_questions: Json | null;
          status: "open" | "closed" | "completed";
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          duration_hours: number;
          classroom: string;
          max_participants: number;
          class_date: string;
          class_time: string;
          registration_deadline: string;
          materials?: Json[] | null;
          practice_questions?: Json | null;
          status?: "open" | "closed" | "completed";
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          duration_hours?: number;
          classroom?: string;
          max_participants?: number;
          class_date?: string;
          class_time?: string;
          registration_deadline?: string;
          materials?: Json[] | null;
          practice_questions?: Json | null;
          status?: "open" | "closed" | "completed";
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          class_id: string;
          payment_status: "pending" | "verified" | "rejected";
          payment_proof: string | null;
          payment_date: string | null;
          verified_by: string | null;
          verified_at: string | null;
          attended: boolean;
          attended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          class_id: string;
          payment_status?: "pending" | "verified" | "rejected";
          payment_proof?: string | null;
          payment_date?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          attended?: boolean;
          attended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          class_id?: string;
          payment_status?: "pending" | "verified" | "rejected";
          payment_proof?: string | null;
          payment_date?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          attended?: boolean;
          attended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
