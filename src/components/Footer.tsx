export default function Footer() {
  return (
    <footer className="bg-primary-950 text-white mt-auto border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">BIOS LMS</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Platform pembelajaran eksklusif untuk mahasiswa Teknik Informatika
              UBM
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-sm">
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
            <h4 className="text-lg font-semibold mb-4 text-white">Kontak</h4>
            <ul className="space-y-2 text-sm text-gray-400">
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

        <div className="border-t border-primary-800/50 mt-8 pt-8 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center">
            &copy; {new Date().getFullYear()} BIOS - UBM. All rights reserved.
            <span className="ml-2 text-accent-bright">|</span>
            <span className="ml-2">Made with ❤️ for UBM Students</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
