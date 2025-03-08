import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RequestFeatures {
  method: string;
  path: string;
  url: string;
  headers: Record<string, string>;
  payload: string;
  ip: string;
  timestamp: number;
}

interface PredictionResult {
  isThreat: boolean;
  confidence: number;
  threatType: string | null;
  details: string;
}

serve(async (req) => {
  try {
    const features: RequestFeatures = await req.json();
    const result = await analyzeRequest(features);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function analyzeRequest(features: RequestFeatures): Promise<PredictionResult> {
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Threat patterns and suspicious headers
  const threatPatterns = new Map([
    ['sql_injection', /('|--|;|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b|\bOR\b|\bAND\b)/i],
    ['xss', /<[^>]*script|javascript:|data:|<[^>]*on\w+\s*=|eval\(|setTimeout\(|setInterval\(/i],
    ['path_traversal', /\.\.\/|\.\.\\|~\/|file:/i],
    ['command_injection', /;|\||&|`|\$\(|\$\{/],
    ['lfi', /\b(?:include|require)(?:_once)?\b.*?(?:\/|\\)/i],
    ['nosql_injection', /\{\s*\$(?:ne|eq|lt|gt|regex|where|exists)/i]
  ]);

  const suspiciousHeaders = new Set([
    'x-forwarded-for',
    'x-originally-forwarded-for',
    'x-remote-addr',
    'x-remote-ip',
    'x-client-ip'
  ]);

  // Get protected sites for the user
  const { data: protectedSites } = await supabase
    .from('protected_sites')
    .select('url, is_protected')
    .eq('is_protected', true);

  // Check if request is for a protected site
  const requestHost = new URL(features.url).hostname;
  const isProtectedSite = protectedSites?.some(site => {
    const siteHost = new URL(site.url).hostname;
    return requestHost.includes(siteHost);
  });

  if (!isProtectedSite) {
    return {
      isThreat: false,
      confidence: 0,
      threatType: null,
      details: 'Site not protected by WAF'
    };
  }

  // Calculate threat scores
  const scores = await Promise.all([
    analyzePatterns(features, threatPatterns),
    analyzeHeaders(features, suspiciousHeaders),
    analyzeFrequency(features, supabase),
    analyzeBehavior(features, supabase)
  ]);

  // Aggregate scores with weights
  const weights = [0.4, 0.2, 0.2, 0.2];
  const totalScore = scores.reduce((acc, score, idx) => acc + score * weights[idx], 0);

  // Determine if it's a threat
  const isThreat = totalScore > 0.7;
  const threatType = determineThreatType(features, threatPatterns);

  // Log the prediction
  await logPrediction(supabase, {
    timestamp: new Date().toISOString(),
    ip: features.ip,
    threat_score: totalScore,
    is_threat: isThreat,
    threat_type: threatType,
    request_path: features.path,
    request_method: features.method
  });

  return {
    isThreat,
    confidence: totalScore,
    threatType,
    details: generateDetails(features, totalScore)
  };
}

// Helper functions
async function analyzePatterns(features: RequestFeatures, threatPatterns: Map<string, RegExp>): Promise<number> {
  let score = 0;
  const content = `${features.path} ${features.payload}`.toLowerCase();

  for (const [, pattern] of threatPatterns) {
    if (pattern.test(content)) {
      score += 0.3;
    }
  }

  return Math.min(score, 1);
}

async function analyzeHeaders(features: RequestFeatures, suspiciousHeaders: Set<string>): Promise<number> {
  let score = 0;
  const headers = Object.keys(features.headers).map(h => h.toLowerCase());

  for (const header of headers) {
    if (suspiciousHeaders.has(header)) {
      score += 0.2;
    }
  }

  return Math.min(score, 1);
}

async function analyzeFrequency(features: RequestFeatures, supabase: any): Promise<number> {
  try {
    const { data: recentRequests } = await supabase
      .from('request_logs')
      .select('timestamp')
      .eq('ip', features.ip)
      .gte('timestamp', new Date(Date.now() - 60000).toISOString());

    if (!recentRequests) return 0;

    const requestsPerMinute = recentRequests.length;
    
    if (requestsPerMinute > 100) return 1;
    if (requestsPerMinute > 60) return 0.7;
    if (requestsPerMinute > 30) return 0.4;
    
    return 0;
  } catch {
    return 0;
  }
}

async function analyzeBehavior(features: RequestFeatures, supabase: any): Promise<number> {
  try {
    const { data: recentPatterns } = await supabase
      .from('request_logs')
      .select('request_path, request_method')
      .eq('ip', features.ip)
      .gte('timestamp', new Date(Date.now() - 300000).toISOString());

    if (!recentPatterns || recentPatterns.length < 5) return 0;

    let score = 0;
    const uniquePaths = new Set(recentPatterns.map(p => p.request_path)).size;
    const uniqueMethods = new Set(recentPatterns.map(p => p.request_method)).size;

    if (uniquePaths > 20) score += 0.4;
    if (uniqueMethods > 3) score += 0.3;
    if (isMethodSuspiciousForPath(features.method, features.path)) {
      score += 0.3;
    }

    return Math.min(score, 1);
  } catch {
    return 0;
  }
}

function isMethodSuspiciousForPath(method: string, path: string): boolean {
  if (/\.(jpg|jpeg|png|gif|css|js|ico)$/i.test(path)) {
    return ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase());
  }
  return false;
}

function determineThreatType(features: RequestFeatures, threatPatterns: Map<string, RegExp>): string | null {
  const content = `${features.path} ${features.payload}`.toLowerCase();

  for (const [type, pattern] of threatPatterns) {
    if (pattern.test(content)) {
      return type;
    }
  }

  return null;
}

function generateDetails(features: RequestFeatures, score: number): string {
  const details = [];

  if (score > 0.7) details.push('High threat probability detected');
  if (score > 0.4) details.push('Suspicious patterns found');
  if (isMethodSuspiciousForPath(features.method, features.path)) {
    details.push('Unusual HTTP method for resource type');
  }

  return details.join('. ');
}

async function logPrediction(supabase: any, data: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('request_logs')
      .insert([data]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging prediction:', error);
  }
}