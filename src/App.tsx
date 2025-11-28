import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './hooks/useRedux';
import TemplateListPage from './pages/TemplateListPage';
import ImportPage from './pages/ImportPage';
import EditorPage from './pages/EditorPage';
import LegacyAlertsDashboard from './pages/LegacyAlertsDashboard';
import LegacyAlertDetails from './pages/LegacyAlertDetails';

const AppContent: React.FC = () => {
  const { isDarkMode } = useAppSelector(state => state.theme);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <div className={`${isDarkMode ? 'dark' : ''}`}>
        <Routes>
          <Route path="/dashboard" element={<TemplateListPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/legacy-alerts" element={<LegacyAlertsDashboard />} />
          <Route path="/legacy-alerts/:alertId" element={<LegacyAlertDetails />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;