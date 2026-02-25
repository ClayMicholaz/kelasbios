import { Class } from "@/types";
import {
  formatDate,
  formatTime,
  formatCurrency,
  getDaysRemaining,
} from "@/lib/utils";
import Link from "next/link";

interface ClassCardProps {
  classData: Class & { enrollment_count?: number };
  showEnrollButton?: boolean;
}

export default function ClassCard({
  classData,
  showEnrollButton = true,
}: ClassCardProps) {
  const daysRemaining = getDaysRemaining(classData.registration_deadline);
  const availableSeats =
    classData.max_participants - (classData.enrollment_count || 0);
  const isDeadlinePassed = daysRemaining < 0;
  const isFull = availableSeats <= 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
            {classData.title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              classData.status === "open"
                ? "bg-emerald-100 text-emerald-700"
                : classData.status === "closed"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
            }`}
          >
            {classData.status === "open"
              ? "Buka"
              : classData.status === "closed"
                ? "Tutup"
                : "Selesai"}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {classData.description}
        </p>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center text-gray-700">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {formatDate(classData.class_date)} •{" "}
              {formatTime(classData.class_time)}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{classData.duration_hours} jam</span>
          </div>

          <div className="flex items-center text-gray-700">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>{classData.classroom}</span>
          </div>

          <div className="flex items-center text-gray-700">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              className={
                availableSeats < 5 && availableSeats > 0
                  ? "text-orange-600 font-semibold"
                  : ""
              }
            >
              {availableSeats} / {classData.max_participants} kursi tersisa
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-2xl font-bold text-primary-950">
              {formatCurrency(10000)}
            </p>
            {!isDeadlinePassed && (
              <p className="text-xs text-gray-500">
                {daysRemaining > 0
                  ? `Tutup dalam ${daysRemaining} hari`
                  : "Tutup hari ini"}
              </p>
            )}
          </div>

          {showEnrollButton && classData.status === "open" && (
            <Link
              href={`/class/${classData.id}`}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                isDeadlinePassed || isFull
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary-800 text-white hover:bg-primary-700"
              }`}
            >
              {isDeadlinePassed ? "Ditutup" : isFull ? "Penuh" : "Daftar"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
