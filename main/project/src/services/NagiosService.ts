import { createClient } from '@supabase/supabase-js';

interface NagiosMetric {
  timestamp: number;
  value: number;
  type: 'traffic' | 'latency' | 'errors';
  host: string;
}

export class NagiosService {
  private static instance: NagiosService;
  private supabase;
  private simulationInterval: number = 1000; // 1 second for simulation
  private isSimulated: boolean = true;
  private connectionError: string | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private lastValue: number = 46; // Start with realistic default value

  private constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      }
    );
  }

  public static getInstance(): NagiosService {
    if (!NagiosService.instance) {
      NagiosService.instance = new NagiosService();
    }
    return NagiosService.instance;
  }

  private async insertMetric(value: number) {
    try {
      // Check connection first
      if (this.isSimulated || this.retryCount >= this.maxRetries) {
        // Stay in simulation mode
        window.dispatchEvent(new CustomEvent('nagios-metric', {
          detail: {
            value,
            timestamp: Date.now(),
            isSimulated: true
          }
        }));
      } else {
        const { error: healthError } = await this.supabase.from('network_metrics').select('id').limit(1);
        
        if (healthError) {
          this.retryCount++;
          throw healthError;
        }

        // If we get here, connection is successful
        this.isSimulated = false;
        this.retryCount = 0;

        await this.supabase
          .from('network_metrics')
          .insert([{
            value,
            type: 'traffic',
            host: 'localhost'
          }]);

        // Emit real metric event for subscribers
        window.dispatchEvent(new CustomEvent('nagios-metric', {
          detail: {
            value,
            timestamp: Date.now(),
            isSimulated: false
          }
        }));
      }
    } catch (error) {
      // Stay in simulation mode on error
      this.isSimulated = true;
      window.dispatchEvent(new CustomEvent('nagios-metric', {
        detail: {
          value,
          timestamp: Date.now(),
          isSimulated: true
        }
      }));
      this.lastValue = value;
    }
  }

  public getStatus() {
    return {
      isSimulated: this.isSimulated,
      connectionError: this.connectionError
    };
  }

  public startSimulation() {
    // Simulate network traffic with realistic patterns
    const baseTraffic = this.lastValue; // Use last value as base
    let trend = 0; // Current trend direction
    
    return setInterval(() => {
      // Add some randomness to base traffic when in simulation mode
      const simulatedBase = this.isSimulated ?
        baseTraffic + Math.sin(Date.now() / 10000) * 20 : 
        baseTraffic;

      // Randomly adjust trend
      trend += (Math.random() - 0.5) * 0.2;
      trend = Math.max(-1, Math.min(1, trend)); // Keep trend between -1 and 1
      
      // Calculate new value with trend and random noise
      const noise = Math.random() * 20 - 10;
      const trendImpact = trend * (this.isSimulated ? 30 : 20); // More variation in simulation
      
      // Add periodic spikes to make simulation more interesting
      const periodicSpike = this.isSimulated ?
        Math.sin(Date.now() / 5000) * 15 * Math.random() : 
        0;
      
      const value = Math.max(0, Math.min(100, simulatedBase + trendImpact + noise));
      
      this.insertMetric(Math.round(value));
    }, this.simulationInterval);
  }
}