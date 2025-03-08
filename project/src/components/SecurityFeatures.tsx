import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, Activity } from 'lucide-react';

export function SecurityFeatures() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-400" />,
      title: 'AI-Powered Protection',
      description: 'Advanced threat detection powered by machine learning'
    },
    {
      icon: <Lock className="w-6 h-6 text-green-400" />,
      title: 'Real-time Monitoring',
      description: 'Continuous security analysis and traffic inspection'
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
      title: 'Threat Prevention',
      description: 'Proactive blocking of malicious activities'
    },
    {
      icon: <Activity className="w-6 h-6 text-purple-400" />,
      title: 'Performance Analytics',
      description: 'Comprehensive security metrics and insights'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature, index) => (
        <div
          key={index}
          className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl transition-all duration-300 hover:scale-[1.02]"
          onMouseEnter={() => setHoveredFeature(index)}
          onMouseLeave={() => setHoveredFeature(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative p-6">
            <div className="p-2 bg-slate-700/50 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-400">{feature.description}</p>
          </div>

          {/* Animated Border */}
          <div className="absolute inset-0 border border-blue-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}