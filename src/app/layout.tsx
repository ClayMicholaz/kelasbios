import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PolicyCard from "@/components/PolicyCard";

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
    google: "wCJ4618uQYlQOFViXg5BBcMRC20LpuWdasmIM0iAk80", // ← Ganti dengan kode verifikasi GSC Anda
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

  // Manifest for PWA
  manifest: "/manifest.json",

  // Canonical URL
  metadataBase: new URL("https://kelasbios.vercel.app"),

  // Alternate languages (if you plan to support multiple languages)
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
    },
  },

  // Additional icons for various platforms
  icons: {
    icon: [
      { url: "/logo-bios.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/logo-bios.svg",
      },
    ],
  },

  // Theme color for mobile browsers
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e3a8a" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],

  // Additional metadata for better SEO
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "BIOS LMS",
    "application-name": "BIOS LMS",
    "msapplication-TileColor": "#1e3a8a",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BIOS - Bina Informatika Optimis Sukses",
    alternateName: "Himpunan Mahasiswa Teknik Informatika UBM",
    url: "https://kelasbios.vercel.app",
    logo: "https://kelasbios.vercel.app/logo-bios.svg",
    description:
      "Himpunan Mahasiswa Teknik Informatika Universitas Bunda Mulia (UBM) Ancol, Jakarta",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Lodan Raya No.2",
      addressLocality: "Ancol",
      addressRegion: "Jakarta Utara",
      postalCode: "14430",
      addressCountry: "ID",
    },
    parentOrganization: {
      "@type": "EducationalOrganization",
      name: "Universitas Bunda Mulia",
      url: "https://www.ubm.ac.id",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BIOS LMS - Learning Management System",
    url: "https://kelasbios.vercel.app",
    description:
      "Platform Learning Management System untuk mahasiswa Teknik Informatika Universitas Bunda Mulia",
    inLanguage: "id-ID",
    publisher: {
      "@type": "Organization",
      name: "BIOS UBM",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://kelasbios.vercel.app/?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="id">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="grow">{children}</main>
        <Footer />
        <PolicyCard />
      </body>
    </html>
  );
}
