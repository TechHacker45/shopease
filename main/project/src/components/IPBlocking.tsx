import React, { useState, useEffect, useCallback } from 'react';
import { Shield, XCircle, AlertTriangle } from 'lucide-react';
import { useWAF, BlockedIP } from '../hooks/useWAF';
import Swal from 'sweetalert2';
import { createClient } from '@supabase/supabase-js';

export function IPBlocking() {
  const { stats, isLoading, refreshBlockedIPs, refreshSites } = useWAF();
  const [newIP, setNewIP] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
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

  const refreshData = async () => {
    setIsRefreshing(true);
    setConnectionError(null);
    try {
      // Refresh both blocked IPs and site data
      await refreshBlockedIPs();
      await refreshSites();

      // Refresh materialized views
      await supabase.rpc('refresh_materialized_views');
      await Swal.fire({
        title: 'Refreshed',
        text: 'IP blocking data has been updated',
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to database';
      setConnectionError(errorMessage);
      await Swal.fire({
        title: 'Error',
        text: 'Unable to connect to database. Using cached data.',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Validate IP address format
  const isValidIP = (ip: string): boolean => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    return ip.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255);
  };
  // Add debounced refresh function
  const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  const debouncedRefresh = useCallback(
    debounce(async () => {
      await refreshBlockedIPs();
    }, 1000),
    [refreshBlockedIPs]
  );

  // Refresh on mount
  useEffect(() => {
    debouncedRefresh();
    return () => {
      // Cleanup
    };
  }, [debouncedRefresh]);

  const handleAddIP = async () => {
    if (!newIP.trim()) {
      await Swal.fire({
        title: 'Missing IP',
        text: 'Please enter an IP address',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (!isValidIP(newIP)) {
      await Swal.fire({
        title: 'Invalid IP',
        text: 'Please enter a valid IP address (e.g., 192.168.1.1)',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsBlocking(true);
    try {
      // Check if IP already exists
      const { data: existingIPs, error: checkError } = await supabase
        .from('blocked_ips')
        .select('*')
        .eq('ip_address', newIP);

      if (checkError) {
        throw checkError;
      }

      const existingIP = existingIPs?.[0];

      if (existingIP) {
        // If IP exists but is inactive, reactivate it
        if (!existingIP.is_active) {
          const { error: updateError } = await supabase
            .from('blocked_ips')
            .update({ 
              block_count: existingIP.block_count + 1,
              is_active: true,
              last_blocked_at: new Date().toISOString()
            })
            .eq('ip_address', newIP);

          if (updateError) throw updateError;
        } else {
          await Swal.fire({
            title: 'IP Already Blocked',
            text: 'This IP address is already blocked',
            icon: 'info',
            background: '#1e293b',
            color: '#fff',
            confirmButtonColor: '#3b82f6'
          });
          setIsBlocking(false);
          return;
        }
      } else {
        // Insert new blocked IP
        const { error } = await supabase
          .from('blocked_ips')
          .insert([{
            ip_address: newIP,
            reason: 'Manually blocked',
            block_count: 1,
            is_active: true,
            first_blocked_at: new Date().toISOString(),
            last_blocked_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setNewIP('');
      // Refresh both blocked IPs and site data
      await refreshBlockedIPs();
      await refreshSites();

      await Swal.fire({
        title: 'IP Blocked',
        text: existingIP && !existingIP.is_active 
          ? 'IP address has been reactivated and blocked'
          : 'IP address has been blocked',
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } catch (error) {
      console.error('Failed to block IP:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to block IP address',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async (ip: string) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Unblock',
        text: `Are you sure you want to unblock ${ip}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, unblock',
        cancelButtonText: 'Cancel',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });

      if (!result.isConfirmed) return;

      // Call Edge Function to handle unblocking
      const { error } = await supabase.functions.invoke('unblock-ip', {
        body: JSON.stringify({ ip })
      });

      if (error) throw error;

      // Refresh both blocked IPs and site data
      await refreshBlockedIPs();
      await refreshSites();

      await Swal.fire({
        title: 'Success',
        text: 'IP address has been unblocked',
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } catch (error) {
      console.error('Failed to unblock IP:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to unblock IP address',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  return (
    <div className="relative overflow-hidden transition-all duration-300 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <div className="relative">
              <Shield className="w-6 h-6 text-red-400" />
              {isRefreshing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">IP Blocking</h2>
            <p className="text-sm text-slate-400">
              {isRefreshing ? 'Refreshing data...' : 'Manage blocked IP addresses'}
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Refresh blocked IPs"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Add IP Form */}
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="Enter IP address to block"
                className="w-full sm:flex-1 bg-slate-600/50 border border-slate-500/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50"
                disabled={isBlocking}
              />
              <button
                onClick={handleAddIP}
                disabled={isBlocking}
                className="w-full sm:w-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 border border-red-500/20 hover:border-red-500/40 shadow-lg hover:shadow-red-500/20"
              >
                {isBlocking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
                    <span>Blocking...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Block IP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Blocked IPs List */}
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Recently Blocked IPs</h3>
            {isLoading ? (
              <div className="text-center py-4 space-y-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm text-slate-400">Loading blocked IPs...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {connectionError ? (
                  <div className="text-center py-4 space-y-2">
                    <div className="text-yellow-400">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                      <p>Connection Error</p>
                    </div>
                    <p className="text-sm text-slate-400">
                      Unable to fetch real-time data. Using cached data.
                    </p>
                    <button
                      onClick={refreshData}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : stats.topBlockedIPs?.length === 0 ? (
                  <div className="text-center text-slate-400 py-4">
                    No blocked IPs yet
                  </div>
                ) : (
                  stats.topBlockedIPs.map((ip, index) => (
                    <div
                      key={ip.ip}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-600/30 rounded-lg space-y-2 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-white font-mono">{ip.ip}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 pl-7 sm:pl-0">
                        <span className="text-sm text-slate-400" title={`First blocked: ${new Date(ip.firstBlocked).toLocaleString()}`}>
                          {ip.count} attempts
                        </span>
                        <button
                          onClick={() => handleUnblock(ip.ip)}
                          className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition-all duration-300 transform hover:scale-105 border border-slate-600/50 hover:border-slate-500/50 shadow-sm hover:shadow-md flex items-center justify-center space-x-1"
                        >
                          <Shield className="w-3 h-3" />
                          <span>
                          Unblock
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}