import React from 'react';
import { Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, subtitle, trend, icon = <Activity className="w-5 h-5" /> }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">{title}</span>
          <div className="p-2 bg-blue-500/20 rounded-lg">
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold text-white">{value}</div>
          {trend !== undefined && (
            <div className={`flex items-center text-sm ml-2 ${
              trend >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        {subtitle && (
          <div className="mt-1 text-sm text-slate-400">{subtitle}</div>
        )}
      </div>
    </div>
  );
}