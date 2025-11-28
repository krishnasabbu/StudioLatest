import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Email Template Manager
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-4 py-2 font-medium transition ${
              isActive('/dashboard')
                ? 'text-wf-red dark:text-wf-red border-b-2 border-wf-red'
                : 'text-gray-700 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-red'
            }`}
          >
            Templates
          </button>

          <button
            onClick={() => navigate('/import')}
            className={`px-4 py-2 font-medium transition ${
              isActive('/import')
                ? 'text-wf-red dark:text-wf-red border-b-2 border-wf-red'
                : 'text-gray-700 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-red'
            }`}
          >
            Import Template
          </button>

          <button
            onClick={() => navigate('/editor')}
            className={`px-4 py-2 font-medium transition ${
              isActive('/editor')
                ? 'text-wf-red dark:text-wf-red border-b-2 border-wf-red'
                : 'text-gray-700 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-red'
            }`}
          >
            Editor
          </button>

          <button
            onClick={() => navigate('/legacy-alerts')}
            className={`px-4 py-2 font-medium transition ${
              isActive('/legacy-alerts')
                ? 'text-wf-red dark:text-wf-red border-b-2 border-wf-red'
                : 'text-gray-700 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-red'
            }`}
          >
            Legacy Alerts
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
