// This file is now deprecated as AI model logic has been moved to Supabase Edge Functions
// Keeping this as a type definition file only

export interface RequestFeatures {
  method: string;
  path: string;
  headers: Record<string, string>;
  payload: string;
  ip: string;
  timestamp: number;
}

export interface PredictionResult {
  isThreat: boolean;
  confidence: number;
  threatType: string | null;
  details: string;
}

// For backward compatibility
export class WAFModel {
  private static instance: WAFModel;
  
  private constructor() {}

  public static getInstance(): WAFModel {
    if (!WAFModel.instance) {
      WAFModel.instance = new WAFModel();
    }
    return WAFModel.instance;
  }

  public getAccuracy(): number {
    return 0.95; // Default accuracy
  }
}