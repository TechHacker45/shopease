import { SecurityRule, SecurityAlert } from '../models/types';

export class SecurityController {
  private static instance: SecurityController;

  private constructor() {}

  public static getInstance(): SecurityController {
    if (!SecurityController.instance) {
      SecurityController.instance = new SecurityController();
    }
    return SecurityController.instance;
  }

  async getSecurityRules(): Promise<SecurityRule[]> {
    // TODO: Implement API call to backend
    return [];
  }

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    // TODO: Implement API call to backend
    return [];
  }

  async updateRule(rule: SecurityRule): Promise<void> {
    // TODO: Implement API call to backend
  }
}