import React, { useState, memo } from 'react';
import { Shield, AlertTriangle, Activity, Server, Wifi, Zap, Users, Database } from 'lucide-react';
import Swal from 'sweetalert2';

const INITIAL_STATS = {
  threats: '0',
  blockedIPs: '0',
  requestsPerSecond: '0',
  threatsBlocked: '0',
  botsBlocked: '0',
  eventsLogged: '8'
};

// Memoized Components
const MemoizedStatusCard = memo(StatusCard);
const MemoizedFeatureCard = memo(FeatureCard);
const MemoizedNetworkStat = memo(NetworkStat);

export function Dashboard() {
  const [isProtectionActive, setIsProtectionActive] = useState(false);

  const toggleProtection = () => {
    setIsProtectionActive(prev => {
      const newState = !prev;
      
      Swal.fire({
        title: newState ? 'Firewall Activated!' : 'Firewall Deactivated',
        text: newState 
          ? 'AI-WAF protection is now active and monitoring your network.'
          : 'AI-WAF protection has been turned off.',
        icon: newState ? 'success' : 'warning',
        background: '#1A2234',
        color: '#fff',
        confirmButtonColor: newState ? '#3B82F6' : '#EF4444',
        confirmButtonText: 'OK',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Security Overview</h1>
          <p className="text-gray-400">Real-time network security monitoring and threat detection</p>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <MemoizedStatusCard
            icon={<Shield className="h-6 w-6 text-blue-400" />}
            title="24h Threats"
            value={INITIAL_STATS.threats}
            trend="+0.0%"
            confidence="Confidence: 0.0%"
            bgColor="bg-[#1A2234]"
          />
          <MemoizedStatusCard
            icon={<AlertTriangle className="h-6 w-6 text-red-400" />}
            title="IPs Blocked"
            value={INITIAL_STATS.blockedIPs}
            trend="-0"
            confidence="Confidence: 0.0%"
            bgColor="bg-[#231E2D]"
          />
          <ProtectionButton
            isActive={isProtectionActive}
            onToggle={toggleProtection}
          />
        </div>

        {/* Feature Cards */}
        <FeatureCards stats={INITIAL_STATS} />

        {/* Network Monitor and IP Blocking */}
        <MonitoringSection />
      </div>
    </div>
  );
}

// Extracted Components
const ProtectionButton = memo(({ isActive, onToggle }: { isActive: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`relative button-3d gradient-border ${
      isActive ? 'from-green-500 to-green-600' : 'from-gray-600 to-gray-700'
    } rounded-lg p-6 transform transition-all duration-200 hover:scale-[1.02] active:scale-95
    glass hover-glow w-full`}
  >
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center space-x-3">
        <Activity className={`h-6 w-6 ${isActive ? 'text-green-200' : 'text-gray-400'}`} />
        <span className={`font-medium ${isActive ? 'text-green-200' : 'text-gray-400'}`}>
          Protection {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className={`h-3 w-3 rounded-full ${
        isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
      }`} />
    </div>
  </button>
));

const FeatureCards = memo(({ stats }: { stats: typeof INITIAL_STATS }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {[
      {
        icon: <Activity className="h-6 w-6" />,
        title: "Traffic Interceptor",
        description: "Real-time traffic analysis and rate limiting",
        metric: "Requests/Second",
        value: stats.requestsPerSecond
      },
      {
        icon: <Shield className="h-6 w-6" />,
        title: "Rule-Based Protection",
        description: "Custom security rules and policies",
        metric: "Threats Blocked",
        value: stats.threatsBlocked
      },
      {
        icon: <Server className="h-6 w-6" />,
        title: "Bot Protection",
        description: "Advanced bot detection and mitigation",
        metric: "Bots Blocked",
        value: stats.botsBlocked
      },
      {
        icon: <Database className="h-6 w-6" />,
        title: "Monitoring & Logging",
        description: "Comprehensive security monitoring",
        metric: "Events Logged",
        value: stats.eventsLogged
      }
    ].map((card) => (
      <MemoizedFeatureCard
        key={card.title}
        icon={card.icon}
        title={card.title}
        description={card.description}
        status="Active"
        metric={card.metric}
        value={card.value}
      />
    ))}
  </div>
));

const MonitoringSection = memo(() => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="bg-[#1A2234] rounded-lg p-6 card-3d glass hover-glow">
      <h2 className="text-xl font-semibold mb-4">Network Monitor</h2>
      <p className="text-gray-400 mb-6">Real-time network statistics</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <NetworkStat icon={<Wifi />} label="Packets/Min" value="0" />
        <NetworkStat icon={<Zap />} label="Bandwidth" value="0 B/s" />
        <NetworkStat icon={<Activity />} label="Active Connections" value="0" />
        <NetworkStat icon={<Users />} label="Unique Sources" value="0" />
      </div>
    </div>

    <div className="bg-[#231E2D] rounded-lg p-6 card-3d glass hover-glow">
      <h2 className="text-xl font-semibold mb-4">IP Blocking</h2>
      <p className="text-gray-400 mb-6">Block and manage malicious IP addresses</p>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Enter IP address to block"
          className="flex-1 bg-[#1A2234] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
        />
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          Block IP
        </button>
      </div>
      <div className="mt-4 text-right text-red-400">
        0 IPs Blocked
      </div>
    </div>
  </div>
));

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  confidence: string;
  bgColor: string;
}

function StatusCard({ icon, title, value, trend, confidence, bgColor }: StatusCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-6 card-3d glass hover-glow`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-gray-400">{trend}</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{confidence}</p>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  metric: string;
  value: string;
}

function FeatureCard({ icon, title, description, status, metric, value }: FeatureCardProps) {
  return (
    <div className="bg-[#1A2234] rounded-lg p-6 card-3d glass hover-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#232B3D] rounded-lg">
            {icon}
          </div>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded">
            {status}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">{metric}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
    </div>
  );
}

interface NetworkStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function NetworkStat({ icon, label, value }: NetworkStatProps) {
  return (
    <div className="bg-[#232B3D] rounded-lg p-4 card-3d glass hover-glow">
      <div className="flex items-center space-x-2 mb-2">
        {React.cloneElement(icon as React.ReactElement, { 
          className: "h-4 w-4 text-gray-400"
        })}
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}