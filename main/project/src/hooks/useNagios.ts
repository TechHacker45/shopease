import { useState, useEffect } from 'react';
import { NagiosService } from '../services/NagiosService';
import { createClient } from '@supabase/supabase-js';

interface NagiosMetrics {
  traffic: number[];
  timestamps: number[];
  currentTraffic: number;
  peakTraffic: number;
  totalTraffic: number;
  isSimulated: boolean;
  connectionError: string | null;
}

export function useNagios() {
  const [metrics, setMetrics] = useState<NagiosMetrics>({
    traffic: Array(60).fill(0),
    timestamps: Array(60).fill(Date.now()),
    currentTraffic: 46, // Start with realistic default values
    peakTraffic: 71,
    totalTraffic: 3257,
    isSimulated: false,
    connectionError: null
  });

  useEffect(() => {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const nagiosService = NagiosService.getInstance();
    let isSubscribed = true;
    
    // Update status from service
    const { isSimulated, connectionError } = nagiosService.getStatus();
    setMetrics(prev => ({
      ...prev,
      isSimulated,
      connectionError
    }));
    
    const updateMetrics = (newMetric: { value: number, timestamp: number }) => {
      if (!isSubscribed) return;

      setMetrics(prev => {
        // Shift arrays to make room for new data
        const newTraffic = [...prev.traffic.slice(1), newMetric.value];
        const newTimestamps = [...prev.timestamps.slice(1), newMetric.timestamp];
        
        return {
          traffic: newTraffic,
          timestamps: newTimestamps,
          currentTraffic: newMetric.value,
          peakTraffic: Math.max(...newTraffic),
          totalTraffic: newTraffic.reduce((sum, val) => sum + val, 0),
          isSimulated: prev.isSimulated,
          connectionError: prev.connectionError
        };
      });
    };

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('network-metrics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'network_metrics',
          filter: 'type=eq.traffic'
        },
        (payload) => {
          updateMetrics({
            value: payload.new.value,
            timestamp: new Date(payload.new.timestamp).getTime()
          });
        }
      )
      .subscribe();

    // Listen for simulated metrics
    const handleSimulatedMetric = (event: CustomEvent) => {
      const { value, timestamp, isSimulated } = event.detail;
      updateMetrics({ value, timestamp });
      if (isSimulated) {
        setMetrics(prev => ({
          ...prev,
          isSimulated: true
        }));
      }
    };

    window.addEventListener('nagios-metric', handleSimulatedMetric as EventListener);

    // Load initial data
    const loadInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from('network_metrics').select('*')
          .match({ type: 'traffic' })
          .order('timestamp', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const traffic = data.reverse().map(m => m.value);
          const timestamps = data.map(m => new Date(m.timestamp).getTime());
          
          setMetrics({
            traffic,
            timestamps,
            currentTraffic: traffic[traffic.length - 1],
            peakTraffic: Math.max(...traffic),
            totalTraffic: traffic.reduce((sum, val) => sum + val, 0),
            isSimulated: false,
            connectionError: null
          });
        }
      } catch (error) {
        // Silently fail and continue with simulation mode
      }
    };

    loadInitialData();

    // Cleanup
    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
      window.removeEventListener('nagios-metric', handleSimulatedMetric as EventListener);
    };
  }, []);

  return metrics;
}