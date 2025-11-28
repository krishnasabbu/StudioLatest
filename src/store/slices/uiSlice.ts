import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  pageTitle: string;
  pageTagline: string;
  sidebarCollapsed: boolean;
}

const initialState: UiState = {
  pageTitle: 'Email Template Designer',
  pageTagline: 'Create and manage email templates',
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    setPageTagline: (state, action: PayloadAction<string>) => {
      state.pageTagline = action.payload;
    },
    setPageInfo: (state, action: PayloadAction<{ title: string; tagline: string }>) => {
      state.pageTitle = action.payload.title;
      state.pageTagline = action.payload.tagline;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { setPageTitle, setPageTagline, setPageInfo, toggleSidebar, setSidebarCollapsed } = uiSlice.actions;
export default uiSlice.reducer;
