interface StatisticCardProps {
  title: string;
  value: number;
  color: "blue" | "amber" | "emerald" | "rose";
}

export default function StatisticCard({
  title,
  value,
  color,
}: StatisticCardProps) {
  const colorClasses = {
    blue: "text-blue-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-gray-600">{title}</div>
    </div>
  );
}
