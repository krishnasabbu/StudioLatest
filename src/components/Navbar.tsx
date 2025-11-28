import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { Moon, Sun, LogOut, User, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isDarkMode } = useAppSelector(state => state.theme);
  const { pageTitle, pageTagline } = useAppSelector(state => state.ui);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left section: Back + Title */}
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Title & Tagline */}
          <div>
            <h1 className="text-2xl font-bold text-primary-700 dark:text-white">
              {pageTitle}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {pageTagline}
            </p>
          </div>
        </div>

        {/* Right section: Theme + User + Logout */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-primary-600" />
            )}
          </button>

          {/* User info */}
          <div className="flex items-center gap-2 bg-primary-50 dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
            <User className="h-5 w-5 text-primary-600 dark:text-gray-400" />
            <div className="text-sm leading-tight">
              <div className="text-primary-700 dark:text-gray-300 font-medium">
                {user?.username}
              </div>
              <div className="text-xs text-primary-500 dark:text-gray-400">
                {user?.role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1 border-primary-300 text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 dark:border-gray-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
