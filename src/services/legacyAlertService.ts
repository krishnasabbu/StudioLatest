import { LegacyAlertsResponse } from '../types/legacyAlert';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const legacyAlertService = {
  async getAllAlerts(): Promise<LegacyAlertsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/legacy-alerts`);
      if (!response.ok) {
        throw new Error('Failed to fetch legacy alerts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching legacy alerts:', error);
      throw error;
    }
  },

  async getAlertById(alertId: string): Promise<any> {
    try {
      const allAlerts = await this.getAllAlerts();
      return allAlerts[alertId] || null;
    } catch (error) {
      console.error(`Error fetching alert ${alertId}:`, error);
      throw error;
    }
  },

  async getFileContent(alertId: string, fileName: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/legacy-alerts/${alertId}/file/${fileName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching file ${fileName}:`, error);
      throw error;
    }
  }
};
