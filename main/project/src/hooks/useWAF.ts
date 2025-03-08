import { useState, useEffect, useCallback } from 'react';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import Swal from 'sweetalert2';
import { WAFService } from '../services/WAFService';

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  is_active: boolean;
  block_count: number;
  first_blocked_at: string;
  last_blocked_at: string;
}

export interface WAFStats {
  totalRequests: number;
  blockedRequests: number;
  modelMetrics: {
    accuracy: number;
  };
  topBlockedIPs: Array<{
    ip: string;
    count: number;
    firstBlocked: string;
  }>;
  topAttackTypes: Array<{
    type: string;
    count: number;
  }>;
}

export interface ProtectedSite {
  id: string;
  url: string;
  description?: string;
  isProtected: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  lastChecked?: string;
  metrics?: {
    totalRequests?: number;
    blockedRequests?: number;
    lastAttackAttempt?: string;
  };
}

export function useWAF() {
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }
  ));
  
  const [stats, setStats] = useState<WAFStats>({
    totalRequests: 0,
    blockedRequests: 0,
    modelMetrics: { accuracy: 0.95 },
    topBlockedIPs: [],
    topAttackTypes: []
  } as WAFStats);
  const [protectedSites, setProtectedSites] = useState<ProtectedSite[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isGlobalProtectionEnabled, setIsGlobalProtectionEnabled] = useState(true);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wafService = WAFService.getInstance();

  const refreshBlockedIPs = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setIsSimulated(false);
      setConnectionError(null);
      
      // Check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .eq('is_active', true)
        .order('last_blocked_at', { ascending: false })
        .limit(10); // Limit to improve performance

      if (error) throw error;
      setBlockedIPs(data || []);

      // Get updated stats after refreshing blocked IPs
      const { data: topIPs } = await supabase
        .from('blocked_ips')
        .select('*')
        .eq('is_active', true)
        .order('last_blocked_at', { ascending: false })
        .limit(5);

      setStats(prevStats => ({
        ...prevStats,
        topBlockedIPs: topIPs?.map(ip => ({
          ip: ip.ip_address,
          count: ip.block_count,
          firstBlocked: ip.first_blocked_at
        })) || []
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to database';
      console.error('Error fetching blocked IPs:', errorMessage);
      setConnectionError(errorMessage);
      setIsSimulated(true);
      
      // Set default values on error
      setBlockedIPs([]);
      setStats(prevStats => ({
        ...prevStats,
        topBlockedIPs: []
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [supabase]);

  const toggleGlobalProtection = async (enabled: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) return;

      // Update all sites for this user
      const { error } = await supabase
        .from('protected_sites')
        .update({ is_protected: enabled })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsGlobalProtectionEnabled(enabled);
      await refreshSites();

      await Swal.fire({
        title: enabled ? 'Firewall Enabled' : 'Firewall Disabled',
        text: enabled 
          ? 'AI-WAF protection is now active for all sites' 
          : 'AI-WAF protection has been disabled for all sites',
        icon: enabled ? 'success' : 'warning',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: enabled ? '#22c55e' : '#ef4444'
      });
    } catch (error) {
      console.error('Error toggling global protection:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to update protection status',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const refreshSites = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) return;

      const { data: sites, error } = await supabase
        .from('protected_sites')
        .select(`
          *,
          metrics:site_metrics(
            total_requests,
            blocked_requests,
            last_attack_attempt
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setProtectedSites(sites || []);
      setLastUpdate(Date.now());
      
      // Update WAF service with new protected sites
      await wafService.updateProtectedSites(sites || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to database';
      console.error('Error refreshing sites:', errorMessage);
      setConnectionError(errorMessage);
      setProtectedSites([]);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [supabase]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isInitialLoad) {
          setIsLoading(true);
        }
        
        // Get authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        
        const user = session?.user;
        if (!user) { 
          setIsLoading(false);
          return;
        }

        // Get total requests
        const { count: totalCount } = await supabase
          .from('request_logs')
          .select('*', { count: 'exact', head: true });

        // Get blocked requests
        const { count: blockedCount } = await supabase
          .from('request_logs')
          .select('*', { count: 'exact', head: true })
          .eq('is_threat', true);

        // Get top blocked IPs
        const { data: topIPs } = await supabase
          .from('blocked_ips_view')
          .select('*')
          .order('count', { ascending: false })
          .limit(5);

        // Get blocked IPs
        const { data: blockedIPsData } = await supabase
          .from('blocked_ips')
          .select('*')
          .eq('is_active', true)
          .order('last_blocked_at', { ascending: false });

        setBlockedIPs(blockedIPsData || []);

        // Get top attack types
        const { data: topAttacks } = await supabase
          .from('attack_types_view')
          .select('*')
          .order('count', { ascending: false })
          .limit(5);

        // Get protected sites with metrics
        const { data: sites } = await supabase
          .from('protected_sites')
          .select(`
            *,
            metrics:site_metrics(
              total_requests,
              blocked_requests,
              last_attack_attempt
            )
          `)
          .eq('user_id', user.id);

        setStats({
          totalRequests: totalCount || 0,
          blockedRequests: blockedCount || 0,
          modelMetrics: {
            accuracy: 0.95 // Use fixed accuracy since we moved AI model to Edge Functions
          },
          topBlockedIPs: blockedIPsData?.map(ip => ({
            ip: ip.ip_address,
            count: ip.block_count,
            firstBlocked: ip.first_blocked_at
          })) || [],
          topAttackTypes: topAttacks?.map(attack => ({
            type: attack.threat_type,
            count: parseInt(attack.count)
          })) || []
        });
        setProtectedSites(sites || []);
      } catch (error) {
        let errorMessage = 'An unknown error occurred';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if ((error as PostgrestError)?.message) {
          errorMessage = (error as PostgrestError).message;
        }

        console.error('Error fetching WAF stats:', errorMessage);

        // Only show error alert for network or database errors, not auth issues
        if (!errorMessage.includes('Auth') && !errorMessage.includes('session')) {
          await Swal.fire({
            title: 'Error',
            text: 'Failed to fetch security statistics. Please try again later.',
            icon: 'error',
            background: '#1e293b',
            color: '#fff',
            confirmButtonColor: '#3b82f6'
          });
        }

        // Reset stats on error
        setStats({
          totalRequests: 0,
          blockedRequests: 0,
          modelMetrics: { accuracy: 0.95 }, // Keep default accuracy on error
          topBlockedIPs: [],
          topAttackTypes: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Set up polling with rate limiting
    if (!lastUpdate || Date.now() - lastUpdate > 30000) {
      const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [supabase, lastUpdate]);

  const analyzeRequest = async (features: any): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-request', {
        body: JSON.stringify(features)
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing request:', error);
      throw error;
    }
  };

  return {
    stats,
    isLoading,
    protectedSites,
    isSimulated,
    connectionError,
    blockedIPs,
    analyzeRequest,
    refreshSites,
    refreshBlockedIPs,
    isGlobalProtectionEnabled,
    toggleGlobalProtection
  };
}
