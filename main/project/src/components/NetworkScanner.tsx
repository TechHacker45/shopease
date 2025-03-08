import React, { useState, useCallback } from 'react';
import { Scan, Loader, Wifi } from 'lucide-react';
import Swal from 'sweetalert2';
import { NmapService, NmapScanResult } from '../services/NmapService';

interface NetworkRange {
  start: string;
  end: string;
}

export function NetworkScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<NmapScanResult[]>([]);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [networkRange, setNetworkRange] = useState<NetworkRange>({
    start: '192.168.1.1',
    end: '192.168.1.254'
  });

  const validateIPAddress = (ip: string): boolean => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  };

  const updateProgress = useCallback((progress: number) => {
    setScanProgress(progress);
  }, []);

  const scanNetwork = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      // Validate IP range
      if (!validateIPAddress(networkRange.start) || !validateIPAddress(networkRange.end)) {
        throw new Error('Invalid IP range');
      }

      const nmapService = NmapService.getInstance();
      const results = await nmapService.scanNetwork(
        networkRange.start,
        networkRange.end,
        updateProgress
      );

      if (results.length === 0) {
        await Swal.fire({
          title: 'No Hosts Found',
          text: 'No active hosts were discovered in the specified range',
          icon: 'info',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
      } else {
        setScanResults(results);
        setLastScanTime(new Date().toLocaleString());

        await Swal.fire({
          title: 'Scan Complete',
          text: `Found ${results.length} active hosts`,
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      await Swal.fire({
        title: 'Scan Failed',
        text: error instanceof Error ? error.message : 'Failed to complete network scan',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNetworkRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIPAddress(networkRange.start) || !validateIPAddress(networkRange.end)) {
      await Swal.fire({
        title: 'Invalid IP Range',
        text: 'Please enter valid IP addresses (e.g., 192.168.1.1)',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    scanNetwork();
  };

  return (
    <div className="relative overflow-hidden transition-all duration-300 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Scan className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Network Scanner</h2>
              <p className="text-sm text-slate-400">Discover active hosts on the network</p>
            </div>
          </div>
        </div>

        {/* IP Range Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-slate-400 mb-2">
                Start IP
              </label>
              <input
                type="text"
                id="start"
                name="start"
                value={networkRange.start}
                onChange={handleRangeChange}
                placeholder="192.168.1.1"
                className="w-full bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                disabled={isScanning}
              />
            </div>
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-slate-400 mb-2">
                End IP
              </label>
              <input
                type="text"
                id="end"
                name="end"
                value={networkRange.end}
                onChange={handleRangeChange}
                placeholder="192.168.1.254"
                className="w-full bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                disabled={isScanning}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Scanning... {scanProgress}%</span>
              </>
            ) : (
              <>
                <Scan className="w-4 h-4" />
                <span>Start Network Scan</span>
              </>
            )}
          </button>
        </form>

        {lastScanTime && (
          <p className="text-sm text-slate-400 mb-4">
            Last scan: {lastScanTime}
          </p>
        )}

        {isScanning && (
          <div className="mb-4">
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isScanning ? (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-3">
                <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                <span className="text-slate-400">
                  Scanning network... {scanProgress}% complete
                </span>
              </div>
            </div>
          ) : scanResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scanResults.map((result) => (
                <div
                  key={result.ip}
                  className="bg-slate-700/30 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-white font-mono">{result.ip}</p>
                    </div>
                    {result.status === 'up' && (
                      <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                        Online
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 pl-7">
                    {result.hostname && (
                      <p className="text-sm text-slate-400">
                        Hostname: {result.hostname}
                      </p>
                    )}
                    {result.latency && (
                      <p className="text-sm text-slate-400">
                        Response time: {result.latency}ms
                      </p>
                    )}
                    {result.osMatch && (
                      <p className="text-sm text-slate-400">
                        OS: {result.osMatch}
                      </p>
                    )}
                    {result.ports && result.ports.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-slate-300 mb-1">Open Ports:</p>
                        <div className="space-y-1">
                          {result.ports.map(port => (
                            <p key={port.port} className="text-sm text-slate-400">
                              {port.port} ({port.service || 'unknown'}) - {port.state}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-700/30 rounded-lg p-8 text-center">
              <p className="text-slate-400">
                No scan results yet. Enter an IP range and click "Start Network Scan" to begin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}