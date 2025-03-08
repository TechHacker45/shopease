import React from 'react';
import { Activity, LineChart, Server } from 'lucide-react';
import { useWAF } from '../hooks/useWAF';
import { useNagios } from '../hooks/useNagios';
import { useEffect, useState, useRef } from 'react';
import { NagiosService } from '../services/NagiosService';
import Swal from 'sweetalert2';

export function NetworkMonitor() {
  const { stats, isSimulated: wafSimulated } = useWAF();
  const nagiosMetrics = useNagios();
  const simulationRef = useRef<number | undefined>();

  // Start simulation on mount
  useEffect(() => {
    const nagiosService = NagiosService.getInstance();
    try {
      simulationRef.current = nagiosService.startSimulation();
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
    
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

  const maxValue = nagiosMetrics.peakTraffic || 1;
  const totalRequests = nagiosMetrics.totalTraffic;
  const requestsPerSecond = Math.floor(nagiosMetrics.currentTraffic);

  return (
    <div className="relative overflow-hidden transition-all duration-300 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <LineChart className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Network Activity</h2>
            <p className="text-sm text-slate-400">Real-time traffic monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Requests/sec</span>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {requestsPerSecond}
            </div>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Total Traffic</span>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {totalRequests.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Peak Traffic</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {maxValue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-slate-700/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Network Activity</h3>
          <div className="relative h-48">
            {/* Graph Background Grid */}
            <div className="absolute inset-0">
              {/* Horizontal grid lines */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute w-full border-t border-slate-600/20"
                  style={{ top: `${(i * 25)}%` }}
                />
              ))}
              {/* Vertical grid lines */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute h-full border-r border-slate-600/20"
                  style={{ left: `${(i * 100/11)}%` }}
                />
              ))}
            </div>

            {/* Graph Lines */}
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                </linearGradient>
              </defs>
              
              {/* Area under the line */}
              <path
                d={`M 0 ${48 - (nagiosMetrics.traffic[0] / maxValue) * 44} 
                  ${nagiosMetrics.traffic.map((value, i, arr) => {
                    if (i === 0) return '';
                    const x1 = ((i - 1) / (arr.length - 1)) * 100;
                    const x2 = (i / (arr.length - 1)) * 100;
                    const y1 = 48 - (arr[i - 1] / maxValue) * 44;
                    const y2 = 48 - (value / maxValue) * 44;
                    return `L ${x2}% ${y2}`;
                  }).join(' ')} 
                  L 100% 48 L 0 48 Z`}
                fill="url(#area-gradient)"
                className="transition-all duration-300"
              />
              
              {/* Line */}
              <path
                d={`M 0 ${48 - (nagiosMetrics.traffic[0] / maxValue) * 44} 
                  ${nagiosMetrics.traffic.map((value, i, arr) => {
                    if (i === 0) return '';
                    const x1 = ((i - 1) / (arr.length - 1)) * 100;
                    const x2 = (i / (arr.length - 1)) * 100;
                    const y1 = 48 - (arr[i - 1] / maxValue) * 44;
                    const y2 = 48 - (value / maxValue) * 44;
                    return `L ${x2}% ${y2}`;
                  }).join(' ')}`}
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                fill="none"
                className="transition-all duration-300 ease-in-out"
              />
              
              {/* Data points */}
              {nagiosMetrics.traffic.map((value, i, arr) => i % 5 === 0 || i === arr.length - 1 ? (
                <circle
                  key={i}
                  cx={`${(i / (nagiosMetrics.traffic.length - 1)) * 100}%`}
                  cy={`${48 - (value / maxValue) * 44}`}
                  r="3"
                  fill="rgb(59, 130, 246)"
                  stroke="rgb(30, 41, 59)"
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer hover:r-4"
                  title={`${value} requests at ${new Date(nagiosMetrics.timestamps[i]).toLocaleTimeString()}`}
                />
              ) : null)}
            </svg>
            
            {/* Time labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-slate-400">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="px-1">
                  {i * 10}m
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}