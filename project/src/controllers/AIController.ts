import { createClient } from '@supabase/supabase-js';
import { RequestFeatures, PredictionResult } from '../models/AIModel';

export class AIController {
  private static instance: AIController;
  private supabase;

  private constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  public static getInstance(): AIController {
    if (!AIController.instance) {
      AIController.instance = new AIController();
    }
    return AIController.instance;
  }

  public async analyzeTraffic(request: RequestFeatures): Promise<PredictionResult> {
    try {
      const { data, error } = await this.supabase.functions.invoke('analyze-traffic', {
        body: JSON.stringify(request)
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing traffic:', error);
      throw error;
    }
  }
}