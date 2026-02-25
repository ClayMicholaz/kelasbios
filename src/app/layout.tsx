import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PolicyCard from "@/components/PolicyCard";
import PolicyModal from "@/components/PolicyModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // SEO Title - Include brand, purpose, and location
  title: {
    default: "BIOS LMS - Learning Management System Teknik Informatika UBM",
    template: "%s | BIOS LMS - Universitas Bunda Mulia",
  },

  // Detailed description for search engines
  description:
    "BIOS (Bina Informatika Optimis Sukses) adalah platform Learning Management System untuk mahasiswa Teknik Informatika Universitas Bunda Mulia (UBM) Ancol, Jakarta. Platform pembelajaran online untuk kelas, materi, tugas, dan pembayaran kelas tambahan.",

  // Keywords for SEO (helps search engines understand content)
  keywords: [
    "BIOS",
    "Bina Informatika Optimis Sukses",
    "LMS",
    "Learning Management System",
    "Teknik Informatika",
    "Universitas Bunda Mulia",
    "UBM",
    "Ancol",
    "Jakarta",
    "Mahasiswa Informatika",
    "Himpunan Mahasiswa",
    "E-Learning UBM",
    "Kelas Online UBM",
    "Platform Pembelajaran",
    "Kampus Digital",
    "Sistem Informasi Akademik",
  ],

  // Authors and creator info
  authors: [{ name: "BIOS - Himpunan Mahasiswa Teknik Informatika UBM" }],
  creator: "BIOS UBM",
  publisher: "Universitas Bunda Mulia",

  verification: {
    google: "b19843a5ec79ff64", // ← Ganti dengan kode verifikasi GSC Anda
  },

  // Robots - tell search engines how to index
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph for social media sharing (Facebook, LinkedIn, etc)
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://kelasbios.vercel.app",
    siteName: "BIOS LMS - Universitas Bunda Mulia",
    title: "BIOS LMS - Platform Pembelajaran Teknik Informatika UBM",
    description:
      "Platform Learning Management System untuk mahasiswa Teknik Informatika Universitas Bunda Mulia (UBM) Ancol, Jakarta. Akses kelas, materi pembelajaran, dan layanan akademik online.",
    images: [
      {
        url: "/logo-bios.svg",
        width: 1200,
        height: 630,
        alt: "BIOS LMS - Himpunan Mahasiswa Teknik Informatika UBM",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "BIOS LMS - Platform Pembelajaran Teknik Informatika UBM",
    description:
      "Platform Learning Management System untuk mahasiswa Teknik Informatika Universitas Bunda Mulia (UBM) Ancol, Jakarta.",
    images: ["/logo-bios.svg"],
    creator: "@ubm_bios_ancol",
  },

  // Additional metadata
  category: "Education",
  classification: "Learning Management System",

  // App-specific metadata
  applicationName: "BIOS LMS",
  referrer: "origin-when-cross-origin",

  // Manifest for PWA (if you add one later)
  // manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="grow">{children}</main>
        <Footer />
        <PolicyCard />
        <PolicyModal />
      </body>
    </html>
  );
}
