import { createContext, useContext, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleTheme as toggleThemeAction } from '../store/themeSlice';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector(state => state.theme);

  const theme: Theme = isDarkMode ? 'dark' : 'light';

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
