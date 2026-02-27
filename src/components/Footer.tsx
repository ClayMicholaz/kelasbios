"use client";

import { useEffect, useState } from "react";

// Function to get rotating WhatsApp number based on time
function getRotatingWhatsApp() {
  const numbers = [
    "+62 813-8596-7782",
    "+62 878-7269-7201",
    "+62 818-0660-3511",
    "+62 821-1349-4018",
    "+62 858-9032-6818",
  ];

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Only show between 8 AM and 6 PM
  if (hours < 8 || hours >= 18) {
    return null; // Outside business hours
  }

  // Calculate minutes since 8 AM
  const minutesSince8AM = (hours - 8) * 60 + minutes;

  // Rotate every 150 minutes (2 hours 30 minutes)
  const index = Math.floor(minutesSince8AM / 150) % numbers.length;

  return numbers[index];
}

export default function Footer() {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  useEffect(() => {
    // Set initial number
    setWhatsappNumber(getRotatingWhatsApp());

    // Update every minute to check rotation
    const interval = setInterval(() => {
      setWhatsappNumber(getRotatingWhatsApp());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Format number for WhatsApp link (remove spaces and dashes)
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[\s-]/g, "")}`
    : null;

  return (
    <footer className="bg-primary-950 text-white mt-auto border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">
              BIOS LMS
            </h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Platform pembelajaran eksklusif untuk mahasiswa Teknik Informatika
              UBM
            </p>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <a
                  href="/"
                  className="text-gray-400 hover:text-accent-bright transition-colors"
                >
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-gray-400 hover:text-accent-bright transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/auth/login"
                  className="text-gray-400 hover:text-accent-bright transition-colors"
                >
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              Kontak
            </h4>
            <ul className="space-y-2 text-sm sm:text-base text-gray-400">
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-accent-bright"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                bios@ubm.ac.id
              </li>
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-accent-bright"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                ubm.ac.id
              </li>
              {whatsappLink && whatsappNumber && (
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-accent-bright"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-bright transition-colors"
                  >
                    {whatsappNumber}
                  </a>
                </li>
              )}
              {!whatsappNumber && (
                <li className="flex items-center text-gray-500 text-xs italic">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp (Tutup: 18.00-08.00)
                </li>
              )}
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-accent-bright"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Universitas Bunda Mulia
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800/50 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
          <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0">
            <span>
              &copy; {new Date().getFullYear()} BIOS - UBM. All rights reserved.
            </span>
            <span className="hidden sm:inline mx-2 text-accent-bright">|</span>
            <span className="text-accent-bright sm:text-gray-400">
              Made with ❤️ for UBM Students
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
