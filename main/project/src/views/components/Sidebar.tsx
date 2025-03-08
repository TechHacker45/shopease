import React from 'react';
import { Shield, Home, AlertTriangle, Settings, Database, Activity } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="bg-[#1A2234] w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">AI-WAF</h1>
            <p className="text-sm text-gray-400">Security Dashboard</p>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-[#232B3D]">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-medium">Admin</h2>
              <p className="text-sm text-gray-400">Security Admin</p>
            </div>
          </div>
        </div>
        
        <nav className="space-y-1">
          <SidebarLink icon={<Home />} text="Dashboard" active />
          <SidebarLink icon={<Shield />} text="Security" badge="3" />
          <SidebarLink icon={<AlertTriangle />} text="Threats" badge="1" />
          <SidebarLink icon={<Activity />} text="Logs" />
          <SidebarLink icon={<Settings />} text="Settings" />
          <SidebarLink icon={<Database />} text="About" />
        </nav>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  badge?: string;
}

function SidebarLink({ icon, text, active, badge }: SidebarLinkProps) {
  return (
    <a
      href="#"
      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-500/10 text-blue-400' 
          : 'text-gray-400 hover:bg-[#232B3D] hover:text-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        {React.cloneElement(icon as React.ReactElement, { 
          className: `h-5 w-5 ${active ? 'text-blue-400' : ''}`
        })}
        <span className="font-medium">{text}</span>
      </div>
      {badge && (
        <span className={`px-2 py-1 text-xs rounded-full ${
          text === 'Threats' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {badge}
        </span>
      )}
    </a>
  );
}