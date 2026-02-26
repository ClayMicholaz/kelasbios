import StatisticCard from "./StatisticCard";

interface StatisticsStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

interface StatisticsSectionProps {
  stats: StatisticsStats;
}

export default function StatisticsSection({ stats }: StatisticsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatisticCard title="Total Pendaftar" value={stats.total} color="blue" />
      <StatisticCard title="Pending" value={stats.pending} color="amber" />
      <StatisticCard title="Diterima" value={stats.accepted} color="emerald" />
      <StatisticCard title="Ditolak" value={stats.rejected} color="rose" />
    </div>
  );
}
