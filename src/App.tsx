import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './hooks/useRedux';
import TemplateListPage from './pages/TemplateListPage';
import ImportPage from './pages/ImportPage';
import EditorPage from './pages/EditorPage';
import { getCurrentPage, subscribeToNavigation } from './pages/useNavigate';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<'list' | 'import' | 'editor'>(getCurrentPage());
  const { isDarkMode } = useAppSelector(state => state.theme);

  useEffect(() => {
    const unsubscribe = subscribeToNavigation(() => {
      setCurrentPage(getCurrentPage());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      {currentPage === 'list' && <TemplateListPage />}
      {currentPage === 'import' && <ImportPage />}
      {currentPage === 'editor' && <EditorPage />}
    </div>
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
