import { EmailTemplate } from '../types/template';
import {
  getMockTemplates,
  getMockTemplate,
  createMockTemplate,
  updateMockTemplate,
  deleteMockTemplate,
} from '../lib/mockData';

export const templateService = {
  async getAllTemplates(): Promise<EmailTemplate[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockTemplates());
      }, 100);
    });
  },

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockTemplate(id));
      }, 100);
    });
  },

  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(createMockTemplate(template));
      }, 100);
    });
  },

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = updateMockTemplate(id, updates);
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Template not found'));
        }
      }, 100);
    });
  },

  async deleteTemplate(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = deleteMockTemplate(id);
        if (success) {
          resolve();
        } else {
          reject(new Error('Template not found'));
        }
      }, 100);
    });
  },
};
