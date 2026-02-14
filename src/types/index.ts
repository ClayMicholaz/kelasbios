import { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Class = Database["public"]["Tables"]["classes"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];

export type ClassWithEnrollmentCount = Class & {
  enrollment_count: number;
  available_seats: number;
};

export type EnrollmentWithDetails = Enrollment & {
  class: Class;
  user: {
    full_name: string | null;
    email: string;
  };
};

export type ClassWithMaterials = Class & {
  materials: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
};

export interface PracticeQuestion {
  id: string;
  question: string;
  options?: string[];
  answer?: string;
  type: "multiple_choice" | "essay" | "true_false";
}

export type PaymentStatus = "pending" | "verified" | "rejected";
export type ClassStatus = "open" | "closed" | "completed";
export type UserRole = "member" | "admin";
