import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Swal from 'sweetalert2';
import { useWAF } from '../hooks/useWAF';
import { useAuth } from '../hooks/useAuth';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function ProtectedSites() {
  const { isLoading, protectedSites, refreshSites } = useWAF();
  const { user } = useAuth();
  const [localSites, setLocalSites] = useState(protectedSites);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteDescription, setNewSiteDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setLocalSites(protectedSites);
  }, [protectedSites]);

  const fetchSites = useCallback(async () => {
    if (!user) return;
    await refreshSites();
  }, [user, refreshSites]);

  const handleAddSite = async () => {
    const url = newSiteUrl.trim();
    if (!url) {
      await Swal.fire({
        title: 'Error',
        text: 'Please enter a site URL',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      await Swal.fire({
        title: 'Error',
        text: 'Please enter a valid URL (e.g., https://example.com)',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsAdding(true);
    try {
      // Add site to protected_sites table
      const { error: siteError } = await supabase
        .from('protected_sites')
        .insert([
          {
            url,
            description: newSiteDescription.trim() || null,
            user_id: user?.id,
            is_protected: true,
            status: 'active'
          }
        ]);

      if (siteError) throw siteError;

      // Clear form
      setNewSiteUrl('');
      setNewSiteDescription('');

      // Refresh the sites list
      await fetchSites();
      
      await Swal.fire({
        title: 'Success',
        text: 'Site has been added to protection',
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } catch (error) {
      console.error('Failed to add site:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add site to protection';
      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSite = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This site will no longer be protected by the WAF',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('protected_sites')
          .delete()
          .eq('id', id)
          .eq('user_id', user?.id);

        if (error) throw error;

        // Refresh the sites list
        await fetchSites();

        await Swal.fire({
          title: 'Success',
          text: 'Site has been removed from protection',
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
        console.error('Failed to remove site:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Failed to remove site',
          icon: 'error',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  const handleToggleProtection = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistically update UI
      const updatedSites = localSites.map(site => 
        site.id === id ? { ...site, isProtected: !currentStatus } : site
      );
      setLocalSites(updatedSites);

      // Show confirmation dialog for disabling protection
      const action = currentStatus ? 'disable' : 'enable';
      const result = await Swal.fire({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Protection?`,
        text: currentStatus 
          ? 'This site will no longer be protected by the WAF'
          : 'This site will be protected by the WAF',
        icon: currentStatus ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonText: `Yes, ${action} it`,
        cancelButtonText: 'Cancel',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: currentStatus ? '#ef4444' : '#22c55e',
        cancelButtonColor: '#3b82f6'
      });

      if (!result.isConfirmed) {
        // Revert optimistic update if user cancels
        setLocalSites(protectedSites);
        return;
      }

      // Update the site protection status
      const { error } = await supabase
        .from('protected_sites')
        .update({ is_protected: !currentStatus })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh the sites list
      await refreshSites();

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Protection has been ${currentStatus ? 'disabled' : 'enabled'}`,
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } catch (error) {
      console.error('Failed to toggle protection:', error);
      // Revert optimistic update on error
      setLocalSites(protectedSites);
      
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

  return (
    <div className="relative overflow-hidden transition-all duration-300 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Globe className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Protected Sites</h2>
            <p className="text-sm text-slate-400">Manage websites protected by the WAF</p>
          </div>
        </div>

        {/* Add Site Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="url"
            value={newSiteUrl}
            onChange={(e) => setNewSiteUrl(e.target.value)}
            placeholder="Enter site URL (https://...)"
            className="bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500/50"
            disabled={isAdding}
          />
          <input
            type="text"
            value={newSiteDescription}
            onChange={(e) => setNewSiteDescription(e.target.value)}
            placeholder="Description (optional)"
            className="bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500/50"
            disabled={isAdding}
          />
        </div>
        <button
          onClick={handleAddSite}
          disabled={isAdding}
          className="w-full md:w-auto px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-6"
        >
          {isAdding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-400 border-t-transparent" />
              <span>Adding Site...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Add Site</span>
            </>
          )}
        </button>

        {/* Protected Sites List */}
        <div className="space-y-4">
          {protectedSites.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No sites added yet. Add a site to protect it with the WAF.
            </div>
          ) : (
            localSites.map((site) => (
              <div
                key={site.id}
                className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-green-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-green-400 transition-colors"
                      >
                        {site.url}
                      </a>
                      {site.isProtected ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    {site.description && (
                      <p className="text-sm text-slate-400">{site.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>Added: {new Date(site.createdAt).toLocaleDateString()}</span>
                      {site.lastChecked && (
                        <span>Last Check: {new Date(site.lastChecked).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleProtection(site.id, site.isProtected)}
                      className={`group relative p-2 rounded-lg transition-all duration-300 ${
                        site.isProtected 
                          ? 'bg-green-500/20 hover:bg-green-500/30'
                          : 'bg-red-500/20 hover:bg-red-500/30'
                      }`}
                    >
                      <Shield className={`w-4 h-4 transition-colors duration-300 ${
                        site.isProtected ? 'text-green-400' : 'text-red-400'
                      }`} />
                      <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-slate-800 text-xs text-slate-200 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        {site.isProtected ? 'Disable Protection' : 'Enable Protection'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleRemoveSite(site.id)}
                      className="group relative p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-slate-800 text-xs text-slate-200 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        Remove Site
                      </span>
                    </button>
                  </div>
                </div>

                {/* Site Metrics */}
                {site.metrics && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-slate-600/30 p-3 rounded-lg">
                      <div className="text-sm text-slate-400">Total Requests</div>
                      <div className="text-lg font-semibold text-white">
                        {site.metrics.totalRequests?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="bg-slate-600/30 p-3 rounded-lg">
                      <div className="text-sm text-slate-400">Blocked Attacks</div>
                      <div className="text-lg font-semibold text-white">
                        {site.metrics.blockedRequests?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="bg-slate-600/30 p-3 rounded-lg">
                      <div className="text-sm text-slate-400">Last Attack</div>
                      <div className="text-lg font-semibold text-white">
                        {site.metrics.lastAttackAttempt
                          ? new Date(site.metrics.lastAttackAttempt).toLocaleDateString()
                          : 'None'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}