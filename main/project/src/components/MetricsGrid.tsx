import React from 'react';
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { useWAF } from '../hooks/useWAF';
import { Brain } from 'lucide-react';

export function MetricsGrid() {
  const { stats, protectedSites, isLoading } = useWAF();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Requests"
        value={stats.totalRequests.toLocaleString()}
        icon={<Activity className="w-5 h-5 text-blue-400" />}
        trend={stats.totalRequests > 0 ? 5 : undefined}
      />
      <MetricCard
        title="Blocked Attacks"
        value={stats.blockedRequests.toLocaleString()}
        icon={<Shield className="w-5 h-5 text-red-400" />}
        subtitle={`${stats.topBlockedIPs.length} IPs blocked`}
        trend={stats.blockedRequests > 0 ? -12 : undefined}
      />
      <MetricCard
        title="Active Threats"
        value={stats.topAttackTypes.length}
        icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
        trend={stats.topAttackTypes.length > 0 ? 8 : undefined}
      />
      <MetricCard
        title="Protected Sites"
        value={protectedSites.length.toString()}
        icon={<Lock className="w-5 h-5 text-green-400" />}
      />
    </div>
  );
}