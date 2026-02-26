import { FormSession } from "@/types/formSession";
import { Button } from "@/components/ui/Button";

interface SessionDetailModalProps {
  session: FormSession;
  onClose: () => void;
  onRegister?: () => void;
  userRegistered?: boolean;
  registrationCount?: number;
}

// Add animation styles
const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out;
  }
`;

if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = fadeInUpKeyframes;
  document.head.appendChild(styleElement);
}

export default function SessionDetailModal({
  session,
  onClose,
  onRegister,
  userRegistered = false,
  registrationCount = 0,
}: SessionDetailModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = () => {
    switch (session.status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCapacityColor = () => {
    const percentage = session.kapasitas
      ? (registrationCount / session.kapasitas) * 100
      : 0;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Kembali
              </button>
              <div className="hidden sm:block">
                <span className="text-sm text-gray-500">Detail Kegiatan</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
              >
                {session.status === "active"
                  ? "Pendaftaran Terbuka"
                  : session.status === "draft"
                  ? "Segera Dibuka"
                  : "Pendaftaran Ditutup"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        {session.thumbnail_url ? (
          <div className="h-72 sm:h-96 lg:h-[500px] relative overflow-hidden">
            <img
              src={session.thumbnail_url}
              alt={session.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>
        ) : (
          <div className="h-72 sm:h-96 lg:h-[500px] bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              ></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl sm:text-9xl text-white/30 mb-4">
                  {session.session_type === "kelas" ? "📚" : "👥"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
              <div className="text-white animate-fadeInUp">
                <div className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/25 backdrop-blur-md border border-white/20 text-white shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    {session.session_type === "kelas"
                      ? "📚 Pendaftaran Kelas"
                      : "👥 Open Recruitment"}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-2xl">
                  {session.title}
                </h1>
                {session.description && (
                  <p className="text-lg sm:text-xl lg:text-2xl text-white/95 max-w-4xl leading-relaxed font-medium backdrop-blur-sm">
                    {session.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-12">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Session Type Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white drop-shadow-sm">
                      {session.session_type === "kelas" ? "📚" : "👥"}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">
                  Jenis Kegiatan
                </h3>
                <p className="text-sm text-blue-600 font-medium">
                  {session.session_type === "kelas"
                    ? "Pendaftaran Kelas"
                    : "Open Recruitment"}
                </p>
              </div>

              {/* Price Card (for kelas only) */}
              {session.session_type === "kelas" && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white drop-shadow-sm"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">
                    Biaya Pendaftaran
                  </h3>
                  <p className="text-xl font-black text-blue-600">
                    {formatPrice(session.harga)}
                  </p>
                </div>
              )}

              {/* Capacity Card */}
              {session.kapasitas && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Kapasitas
                  </h3>
                  <p className={`text-lg font-bold ${getCapacityColor()}`}>
                    {registrationCount}/{session.kapasitas}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Sisa {Math.max(0, session.kapasitas - registrationCount)}{" "}
                    tempat
                  </p>
                  <div className="mt-2 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (registrationCount / session.kapasitas) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Room Card (for kelas only) */}
              {session.session_type === "kelas" && session.ruangan && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
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
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ruangan</h3>
                  <p className="text-lg font-bold text-blue-600">
                    {session.ruangan}
                  </p>
                </div>
              )}
            </div>

            {/* Schedule Information Section */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-blue-50 px-8 py-8 border-b border-gray-200">
                <h2 className="text-2xl font-black text-gray-900 flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  📅 Jadwal & Informasi Kegiatan
                </h2>
                <p className="text-gray-600 mt-2 ml-16">
                  Detail waktu dan informasi penting
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Registration Period */}
                  <div className="space-y-4 group">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-5 h-5 text-blue-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          📅 Periode Pendaftaran
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Waktu dibuka dan ditutupnya pendaftaran
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-gray-800">
                              Mulai Pendaftaran
                            </span>
                          </div>
                          <span className="text-sm text-blue-600 font-semibold">
                            {session.start_date
                              ? formatDate(session.start_date)
                              : "Belum ditentukan"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-bold text-gray-800">
                              Batas Akhir
                            </span>
                          </div>
                          <span className="text-sm text-blue-600 font-semibold">
                            {session.end_date
                              ? formatDate(session.end_date)
                              : "Belum ditentukan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Class Schedule (for kelas only) */}
                  {session.session_type === "kelas" && (
                    <div className="space-y-4 group">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                          <svg
                            className="w-5 h-5 text-blue-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            🕰️ Jadwal Kelas
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Waktu pelaksanaan kelas berlangsung
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300">
                        <div className="space-y-4">
                          {session.tanggal_kelas && (
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-bold text-gray-800">
                                  Tanggal Kelas
                                </span>
                              </div>
                              <span className="text-sm text-blue-600 font-semibold">
                                {formatDate(session.tanggal_kelas)}
                              </span>
                            </div>
                          )}

                          {(session.jam_mulai || session.jam_selesai) && (
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-bold text-gray-800">
                                  Waktu Kelas
                                </span>
                              </div>
                              <span className="text-sm text-blue-600 font-semibold">
                                {session.jam_mulai && session.jam_selesai
                                  ? `${formatTime(
                                      session.jam_mulai
                                    )} - ${formatTime(session.jam_selesai)} WIB`
                                  : session.jam_mulai
                                  ? `Mulai ${formatTime(session.jam_mulai)} WIB`
                                  : session.jam_selesai
                                  ? `Sampai ${formatTime(
                                      session.jam_selesai
                                    )} WIB`
                                  : "Belum ditentukan"}
                              </span>
                            </div>
                          )}

                          {session.ruangan && (
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-bold text-gray-800">
                                  Lokasi Ruangan
                                </span>
                              </div>
                              <span className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">
                                {session.ruangan}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                {/* Action Header */}
                <div className="bg-blue-600 px-6 py-10 text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-700 opacity-20"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-3">
                      🚀 Siap untuk bergabung?
                    </h3>
                    <p className="text-blue-100 text-base font-medium leading-relaxed">
                      {session.session_type === "kelas"
                        ? "Daftarkan diri Anda untuk mengikuti kelas ini dan kembangkan skill baru"
                        : "Bergabunglah dengan tim BIOS UBM dan wujudkan potensi terbaikmu"}
                    </p>
                  </div>
                </div>

                {/* Action Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Registration Status */}
                    <div className="text-center">
                      {onRegister && userRegistered ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="font-semibold">
                              Anda Sudah Terdaftar
                            </span>
                          </div>
                          <p className="text-sm text-green-600">
                            Terima kasih telah mendaftar! Pantau terus untuk
                            informasi selanjutnya.
                          </p>
                        </div>
                      ) : session.status === "active" ? (
                        <div className="space-y-4">
                          {/* Call to Action */}
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              Pendaftaran Dibuka
                            </div>

                            {session.session_type === "kelas" &&
                              session.harga && (
                                <div className="mb-4">
                                  <p className="text-2xl font-bold text-gray-900">
                                    {formatPrice(session.harga)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Biaya pendaftaran
                                  </p>
                                </div>
                              )}
                          </div>

                          {/* Main Action Button */}
                          <Button
                            onClick={
                              onRegister ||
                              (() => {
                                // Fallback behavior when onRegister is not provided
                                if (session.session_type === "kelas") {
                                  // Redirect to class registration page
                                  window.open(
                                    `/dashboard?tab=kelas&sessionId=${session.id}`,
                                    "_self"
                                  );
                                } else {
                                  // Redirect to general registration
                                  window.open("/dashboard", "_self");
                                }
                              })
                            }
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              {session.session_type === "kelas"
                                ? "🎯 Daftar Kelas Sekarang"
                                : "🚀 Daftar Sekarang"}
                            </span>
                          </Button>

                          {/* Additional Info */}
                          <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                              Dengan mendaftar, Anda menyetujui syarat dan
                              ketentuan yang berlaku
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-9a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-semibold">
                              Pendaftaran Ditutup
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Maaf, periode pendaftaran untuk kegiatan ini telah
                            berakhir.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                <h4 className="font-bold text-gray-900 mb-5 flex items-center text-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  💬 Butuh Bantuan?
                </h4>
                <div className="space-y-4 text-sm">
                  <a
                    href="mailto:ubmbiosancol@gmail.com?subject=Pertanyaan tentang BIOS UBM&body=Halo BIOS UBM,%0D%0A%0D%0ASaya ingin bertanya tentang..."
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 group cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center">
                        Email
                        <svg
                          className="w-3 h-3 ml-1 opacity-60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </p>
                      <p className="text-gray-600">ubmbiosancol@gmail.com</p>
                    </div>
                  </a>
                  <a
                    href="https://www.instagram.com/bios_ubm_ancol/"
                    className="flex items-center text-gray-700 hover:text-pink-600 transition-colors duration-200 group cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-pink-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-pink-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center">
                        Instagram
                        <svg
                          className="w-3 h-3 ml-1 opacity-60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </p>
                      <p className="text-gray-600">@bios_ubm_ancol</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
