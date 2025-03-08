import React, { useState, useEffect } from 'react';
import { Shield, Activity, AlertTriangle, Lock, Settings, MessageSquare, Info, User, Menu, X } from 'lucide-react';
import { MetricsGrid } from './components/MetricsGrid';
import { NetworkMonitor } from './components/NetworkMonitor';
import { IPBlocking } from './components/IPBlocking';
import { BotnetDetection } from './components/BotnetDetection';
import { ProtectedSites } from './components/ProtectedSites';
import { Auth } from './components/Auth';
import { useWAF } from './hooks/useWAF';
import { useAuth } from './hooks/useAuth';

interface SidebarLinkProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

function SidebarLink({ icon, text, active = false, badge, onClick }: SidebarLinkProps) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={`flex items-center justify-between p-2 lg:p-3 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-500/20 text-blue-400' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-sm lg:text-base">{text}</span>
      </div>
      {badge && (
        <span className={`px-1.5 py-0.5 lg:px-2 lg:py-1 text-[10px] lg:text-xs rounded-full ${
          badge === '!' 
            ? 'bg-red-500/20 text-red-400' 
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {badge}
        </span>
      )}
    </a>
  );
}

export default function App() {
  const { stats, isLoading, toggleGlobalProtection, isGlobalProtectionEnabled } = useWAF();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/90 z-10"></div>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/dr34xfln0/video/upload/v1738054604/background-com_kwmzc1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex flex-col items-end">
            <h2 className="font-bold text-white text-base">AI-WAF</h2>
            <p className="text-xs text-white/80">Security Dashboard</p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-slate-800/90 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-16 lg:pt-0`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-xl">AI-WAF</h2>
              <p className="text-sm text-white/80">Security Dashboard</p>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="p-4 mx-4 bg-slate-700/30 rounded-xl backdrop-blur-sm border border-slate-600/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Admin</h2>
              <p className="text-sm text-blue-400">{user.email}</p>
              {!isLoading && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-slate-400">AI Accuracy:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    stats.modelMetrics.accuracy >= 0.9 
                      ? 'bg-green-500/20 text-green-400' 
                      : stats.modelMetrics.accuracy >= 0.7 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {(stats.modelMetrics.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarLink icon={<Activity className="w-5 h-5" />} text="Dashboard" active />
          <SidebarLink icon={<Lock className="w-5 h-5" />} text="Security" badge="3" />
          <SidebarLink icon={<AlertTriangle className="w-5 h-5" />} text="Threats" badge="!" />
          <SidebarLink icon={<Settings className="w-5 h-5" />} text="Settings" />
          <SidebarLink icon={<MessageSquare className="w-5 h-5" />} text="Logs" />
          <SidebarLink icon={<Info className="w-5 h-5" />} text="About" />
          <SidebarLink 
            icon={<svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>}
            text="Sign Out"
            onClick={signOut}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="relative z-10 lg:ml-64 p-4 lg:p-8 mt-16 lg:mt-0">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl lg:text-3xl font-bold text-white mb-2">Security Overview</h1>
              <p className="text-sm lg:text-base text-slate-400">Real-time network security monitoring and threat detection</p>
            </div>
            <div>
              <button
                onClick={() => toggleGlobalProtection(!isGlobalProtectionEnabled)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isGlobalProtectionEnabled
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="hidden md:inline">
                  {isGlobalProtectionEnabled ? 'Firewall Enabled' : 'Firewall Disabled'}
                </span>
              </button>
            </div>
          </div>

          <MetricsGrid />
        </header>
        <div className="mb-6">
          <ProtectedSites />
        </div>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NetworkMonitor />
            <IPBlocking />
            <BotnetDetection />
          </div>

          
        </div>
      </div>
    </div>
  );
}