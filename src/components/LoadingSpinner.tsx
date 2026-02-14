interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white";
}

export default function LoadingSpinner({
  size = "md",
  color = "primary",
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size];

  const colorClass = {
    primary: "border-indigo-600",
    white: "border-white",
  }[color];

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-b-2 ${sizeClass} ${colorClass}`}
      ></div>
    </div>
  );
}
