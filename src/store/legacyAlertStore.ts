import { create } from 'zustand';
import { LegacyAlertsResponse, ViewMode } from '../types/legacyAlert';
import { legacyAlertService } from '../services/legacyAlertService';

interface LegacyAlertState {
  alerts: LegacyAlertsResponse;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  viewMode: ViewMode;
  selectedAlertId: string | null;
  fileContent: string | null;
  selectedFileName: string | null;

  fetchAlerts: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedAlertId: (id: string | null) => void;
  fetchFileContent: (alertId: string, fileName: string) => Promise<void>;
  clearFileContent: () => void;
}

export const useLegacyAlertStore = create<LegacyAlertState>((set) => ({
  alerts: {},
  isLoading: false,
  error: null,
  searchQuery: '',
  viewMode: 'table',
  selectedAlertId: null,
  fileContent: null,
  selectedFileName: null,

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await legacyAlertService.getAllAlerts();
      set({ alerts, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  setSelectedAlertId: (id: string | null) => set({ selectedAlertId: id }),

  fetchFileContent: async (alertId: string, fileName: string) => {
    set({ isLoading: true, error: null });
    try {
      const content = await legacyAlertService.getFileContent(alertId, fileName);
      set({ fileContent: content, selectedFileName: fileName, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, fileContent: null });
    }
  },

  clearFileContent: () => set({ fileContent: null, selectedFileName: null }),
}));
