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
  title: "BIOS LMS - Learning Management System",
  description:
    "Platform pembelajaran eksklusif untuk mahasiswa Teknik Informatika UBM",
  verification: {
    google: "googleb19843a5ec79ff64.html",
  },
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
