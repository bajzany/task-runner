import React, { useEffect, useState } from 'react';
import CustomerApiClient, { TaskStatsData } from '../clients/CustomerApiClient';

export const TaskStats: React.FC = () => {
  const [stats, setStats] = useState<TaskStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await CustomerApiClient.getStats();
      setStats(data);
    } catch (e) {
      console.error('error', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-500">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="text-red-500 text-center">Failed to load stats</div>;
  }

  const statItems = [
    { label: 'Total tasks', value: stats.total },
    { label: 'Completed', value: stats.completed },
    { label: 'Failed', value: stats.failed },
    { label: 'Cancelled', value: stats.cancelled },
    { label: 'Pending', value: stats.pending },
    { label: 'In Progress', value: stats.in_progress },
    { label: 'Avg Duration', value: `${stats.avg_duration_sec} s` },
    { label: 'Min Duration', value: `${stats.min_duration_sec} s` },
    { label: 'Max Duration', value: `${stats.max_duration_sec} s` },
  ];

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Task Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-4 text-center"
          >
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
