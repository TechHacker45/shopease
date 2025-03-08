import React, { useState } from 'react';
import { Network, Shield, AlertTriangle, Zap } from 'lucide-react';
import { useWAF } from '../hooks/useWAF';

interface BotnetActivity {
  id: string;
  type: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

interface BotnetStats {
  totalBotnets: number;
  activeNodes: number;
  blockedConnections: number;
  threatLevel: 'low' | 'medium' | 'high';
  recentActivities: BotnetActivity[];
}

export function BotnetDetection() {
  const { stats, isLoading } = useWAF();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  // Calculate threat level based on attack patterns and AI model detection
  const calculateThreatLevel = (): 'low' | 'medium' | 'high' => {
    // No attacks detected
    if (stats.topAttackTypes.length === 0) return 'low';

    // Get total attack count in the last period
    const totalAttacks = stats.topAttackTypes.reduce((sum, attack) => sum + attack.count, 0);

    // Check for high-severity attack types
    const hasCriticalAttacks = stats.topAttackTypes.some(attack => 
      attack.type.toLowerCase().includes('botnet') || 
      attack.type.toLowerCase().includes('ddos') ||
      attack.type.toLowerCase().includes('brute_force')
    );

    // Determine threat level based on attack patterns and AI model accuracy
    if (hasCriticalAttacks && totalAttacks > 50) return 'high';
    if (hasCriticalAttacks || totalAttacks > 25) return 'medium';
    return 'low';
  };

  // Calculate botnet stats from AI model data
  const botnetStats: BotnetStats = {
    totalBotnets: stats.topAttackTypes.filter(attack => 
      attack.type.toLowerCase().includes('botnet') || 
      attack.type.toLowerCase().includes('ddos')
    ).length,
    activeNodes: Math.floor(stats.blockedRequests * 0.4), // Estimate active nodes from blocked requests
    blockedConnections: stats.blockedRequests,
    threatLevel: calculateThreatLevel(),
    recentActivities: stats.topAttackTypes
      .filter(attack => attack.count > 0)
      .map((attack, index) => ({
        id: `${index}-${attack.type}`,
        type: attack.type,
        timestamp: new Date().toISOString(),
        severity: attack.count > 100 ? 'high' : 
                 attack.count > 50 ? 'medium' : 'low'
      }))
  };

  const getThreatLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="relative overflow-hidden transition-all duration-300 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Network className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Botnet Detection</h2>
              <p className="text-sm text-slate-400">Active botnet monitoring and mitigation</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {(['1h', '24h', '7d'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Detected Botnets</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <div className="animate-pulse bg-slate-600 h-8 w-16 rounded" />
              ) : (
                botnetStats.totalBotnets
              )}
            </div>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Suspicious Nodes</span>
              <Network className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <div className="animate-pulse bg-slate-600 h-8 w-16 rounded" />
              ) : (
                botnetStats.activeNodes.toLocaleString()
              )}
            </div>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Blocked Connections</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <div className="animate-pulse bg-slate-600 h-8 w-16 rounded" />
              ) : (
                botnetStats.blockedConnections.toLocaleString()
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-700/30 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-300">Threat Level</h3>
            <div className={`flex items-center space-x-2 ${getThreatLevelColor(botnetStats.threatLevel)}`}>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">{botnetStats.threatLevel}</span>
            </div>
          </div>
          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                botnetStats.threatLevel === 'low' ? 'bg-green-400 w-1/3' :
                botnetStats.threatLevel === 'medium' ? 'bg-yellow-400 w-2/3' :
                'bg-red-400 w-full'
              }`}
            />
          </div>
        </div>

        <div className="bg-slate-700/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-slate-600/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-slate-500 h-4 w-4 rounded" />
                    <div>
                      <div className="bg-slate-500 h-4 w-32 rounded mb-1" />
                      <div className="bg-slate-500 h-3 w-24 rounded" />
                    </div>
                  </div>
                  <div className="bg-slate-500 h-6 w-16 rounded-full" />
                </div>
              ))
            ) : botnetStats.recentActivities.length > 0 ? (
              botnetStats.recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-3 bg-slate-600/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-4 h-4 ${
                    activity.severity === 'high' ? 'text-red-400' :
                    activity.severity === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`} />
                  <div>
                    <p className="text-sm text-white">{activity.type}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(activity.severity)}`}>
                  {activity.severity}
                </span>
              </div>
            ))) : (
              <div className="text-center text-slate-400 py-4">
                No recent botnet activities detected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}