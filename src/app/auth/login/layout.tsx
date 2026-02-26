import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Masuk ke Akun BIOS LMS",
  description:
    "Masuk ke akun BIOS LMS Anda. Platform Learning Management System untuk mahasiswa Teknik Informatika Universitas Bunda Mulia (UBM) Ancol, Jakarta.",
  robots: {
    index: false, // Don't index auth pages
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
