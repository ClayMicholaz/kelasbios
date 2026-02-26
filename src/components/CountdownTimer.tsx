"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  deadline: string;
  className?: string;
}

export default function CountdownTimer({
  deadline,
  className = "",
}: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diff = deadlineDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("Sudah ditutup");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdown(`Tutup dalam ${days} hari`);
      } else if (hours > 0) {
        setCountdown(`Tutup dalam ${hours} jam`);
      } else if (minutes > 0) {
        setCountdown(`Tutup dalam ${minutes} menit`);
      } else {
        setCountdown("Tutup sebentar lagi");
      }
    };

    // Calculate immediately
    calculateCountdown();

    // Update every minute
    const interval = setInterval(calculateCountdown, 60000);

    return () => clearInterval(interval);
  }, [deadline]);

  return <span className={className}>{countdown}</span>;
}
