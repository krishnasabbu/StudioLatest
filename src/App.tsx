import { useState, useEffect } from 'react';
import TemplateListPage from './pages/TemplateListPage';
import ImportPage from './pages/ImportPage';
import EditorPage from './pages/EditorPage';
import { getCurrentPage, subscribeToNavigation } from './pages/useNavigate';

function App() {
  const [currentPage, setCurrentPage] = useState<'list' | 'import' | 'editor'>(getCurrentPage());

  useEffect(() => {
    const unsubscribe = subscribeToNavigation(() => {
      setCurrentPage(getCurrentPage());
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {currentPage === 'list' && <TemplateListPage />}
      {currentPage === 'import' && <ImportPage />}
      {currentPage === 'editor' && <EditorPage />}
    </>
  );
}

export default App;
