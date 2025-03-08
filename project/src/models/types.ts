// Common types and interfaces
export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive';
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIP: string;
  blocked: boolean;
}

export interface DashboardStats {
  totalRequests: number;
  blockedRequests: number;
  alertsToday: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}