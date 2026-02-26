interface StatusBadgeProps {
  status: "pending" | "accepted" | "rejected";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const statusConfig = {
    pending: {
      className: "bg-amber-100 text-amber-800 border-amber-200",
      label: "Pending",
    },
    accepted: {
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      label: "Diterima",
    },
    rejected: {
      className: "bg-rose-100 text-rose-800 border-rose-200",
      label: "Ditolak",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`${sizeClasses[size]} font-semibold ${config.className} rounded-full border`}
    >
      {config.label}
    </span>
  );
}
