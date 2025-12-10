import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleTheme } from '../store/slices/themeSlice';

export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector(state => state.theme);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Email Template Manager
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-4 py-2 font-semibold transition-all ${
              isActive('/dashboard')
                ? 'text-wf-red dark:text-wf-red border-b-2 border-wf-red'
                : 'text-gray-700 dark:text-slate-300 hover:text-wf-red dark:hover:text-wf-red'
            }`}
          >
            Templates
          </button>

          <button
            onClick={() => navigate('/import')}
            className={`px-4 py-2 font-semibold transition-all ${
              isActive('/import')
                ? 'text-wf-red dark:text-wf-red border-b-2 border-wf-red'
                : 'text-gray-700 dark:text-slate-300 hover:text-wf-red dark:hover:text-wf-red'
            }`}
          >
            Import Template
          </button>

          <button
            onClick={() => navigate('/editor')}
            className={`px-4 py-2 font-semibold transition-all ${
              isActive('/editor')
                ? 'text-wf-red dark:text-wf-red border-b-2 border-wf-red'
                : 'text-gray-700 dark:text-slate-300 hover:text-wf-red dark:hover:text-wf-red'
            }`}
          >
            Editor
          </button>

          <button
            onClick={() => navigate('/legacy-alerts')}
            className={`px-4 py-2 font-semibold transition-all ${
              isActive('/legacy-alerts')
                ? 'text-wf-red dark:text-wf-red border-b-2 border-wf-red'
                : 'text-gray-700 dark:text-slate-300 hover:text-wf-red dark:hover:text-wf-red'
            }`}
          >
            Legacy Alerts
          </button>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-blue-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
