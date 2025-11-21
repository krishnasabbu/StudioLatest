export type NavigationState = {
  html?: string;
  name?: string;
  description?: string;
  templateId?: string;
};

let currentPage: 'list' | 'import' | 'editor' = 'list';
let navigationState: NavigationState = {};
let listeners: Array<() => void> = [];

export const useNavigate = () => {
  return (page: 'list' | 'import' | 'editor', state?: NavigationState) => {
    currentPage = page;
    navigationState = state || {};
    listeners.forEach((listener) => listener());
  };
};

export const getCurrentPage = () => currentPage;
export const getNavigationState = () => navigationState;

export const subscribeToNavigation = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
