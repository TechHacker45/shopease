import { createClient } from '@supabase/supabase-js';
import { ProtectedSite } from '../hooks/useWAF';

interface TrafficPattern {
  timestamp: number;
  sourceIP: string;
  requestMethod: string;
  path: string;
  headers: Record<string, string>;
  payload: string;
  responseCode: number;
}

export class WAFService {
  private static instance: WAFService;
  private supabase;
  private protectedSites: ProtectedSite[] = [];

  private constructor() {
    let supabaseUrl = '';
    let supabaseKey = '';

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    } else {
      // Node.js environment
      supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    }

    this.supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      }
    );
    this.initializeProtectedSites();
  }

  private async initializeProtectedSites() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user) return;

      const { data: sites } = await this.supabase
        .from('protected_sites')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_protected', true);

      this.protectedSites = sites || [];
    } catch (error) {
      console.error('Error initializing protected sites:', error);
    }
  }

  public async updateProtectedSites(sites: ProtectedSite[]) {
    this.protectedSites = sites;
  }

  private isProtectedDomain(url: string): boolean {
    if (this.protectedSites.length === 0) return false;
    
    try {
      const requestHost = new URL(url).hostname;
      console.log('Request hostname:', requestHost);
      
      // Check if hostname matches any protected site
      return this.protectedSites.some(site => {
        const siteHost = new URL(site.url).hostname;
        const matches = site.isProtected && requestHost.includes(siteHost);
        console.log(`Checking ${siteHost} against ${requestHost}:`, matches);
        return matches;
      });
    } catch (error) {
      console.error('Error checking protected domain:', error);
      return false;
    }
  }

  public static getInstance(): WAFService {
    if (!WAFService.instance) {
      WAFService.instance = new WAFService();
    }
    return WAFService.instance;
  }

  public async processRequest(request: Request): Promise<boolean> {
    try {
      const pattern = await this.extractTrafficPattern(request);
      console.log('Processing request for URL:', request.url);
      
      // Check if the request is for a protected site
      if (!this.isProtectedDomain(request.url)) {
        console.log('Request allowed - domain not in protected list:', request.url);
        return true;
      }

      console.log('Request is for protected domain, analyzing traffic...');
      
      // Call Supabase Edge Function for AI analysis
      const { data: prediction, error } = await this.supabase.functions.invoke('analyze-traffic', {
        body: JSON.stringify(pattern)
      });

      if (error) {
        console.error('Error analyzing traffic:', error);
        throw error;
      }

      console.log('Analysis result:', prediction);
      
      return !prediction.isThreat;
    } catch (error) {
      console.error('Error processing request:', error, '\nRequest URL:', request.url);
      return false; // Block request on error
    }
  }

  private async extractTrafficPattern(request: Request): Promise<TrafficPattern> {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      timestamp: Date.now(),
      sourceIP: headers['x-forwarded-for'] || 'unknown',
      requestMethod: request.method,
      path: new URL(request.url).pathname,
      headers,
      payload: await this.getRequestPayload(request),
      responseCode: 200 // Will be updated after processing
    };
  }

  private async getRequestPayload(request: Request): Promise<string> {
    try {
      const clone = request.clone();
      const text = await clone.text();
      return text;
    } catch {
      return '';
    }
  }
}