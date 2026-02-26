export const getRegistrationDates = () => {
  const registrationStart = new Date(
    process.env.NEXT_PUBLIC_REGISTRATION_START_DATE || "2025-08-25"
  );
  const registrationEnd = new Date(
    process.env.NEXT_PUBLIC_REGISTRATION_END_DATE || "2025-09-01"
  );
  const announcementDate = new Date(
    process.env.NEXT_PUBLIC_ANNOUNCEMENT_DATE || "2025-09-05"
  );

  return {
    registrationStart,
    registrationEnd,
    announcementDate,
  };
};

export const getRegistrationStatus = () => {
  const now = new Date();
  const { registrationStart, registrationEnd, announcementDate } =
    getRegistrationDates();

  if (now < registrationStart) {
    return "not-started"; // Belum dibuka
  } else if (now >= registrationStart && now < registrationEnd) {
    return "open"; // Sedang dibuka
  } else if (now >= registrationEnd && now < announcementDate) {
    return "closed"; // Sudah ditutup, menunggu pengumuman
  } else {
    return "announced"; // Sudah pengumuman
  }
};

export const formatDate = (dateInput: Date | string) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateInput: Date | string) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
