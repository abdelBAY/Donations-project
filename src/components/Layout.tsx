import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  ChevronRight, 
  Settings, 
  HelpCircle, 
  Copy,
  User
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

export default function Layout() {
  const [isLanguageOpen, setIsLanguageOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showResources, setShowResources] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const setDarkMode = useStore((state) => state.setDarkMode);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setShowSettings(false);
        setShowResources(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  const handleSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (confirmed) {
      try {
        await supabase.auth.signOut();
        setUser(null);
        navigate('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  const handleCopyId = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ur', name: 'اردو' }
  ];

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-blue-100 dark:border-gray-700 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="md" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">BladiShare</span>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors duration-200"
                >
                  <span>Language</span>
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-out scale-100 opacity-100 z-50">
                    <div className="py-1" role="menu">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setIsLanguageOpen(false)}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {getInitials(user.email || '')}
                      </span>
                    )}
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-out scale-100 opacity-100 z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Connect ID</span>
                            <button
                              onClick={handleCopyId}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                              title="Copy ID"
                            >
                              <Copy className={`w-4 h-4 ${copySuccess ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} />
                            </button>
                          </div>
                          <div className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            {user.id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="w-full px-3 py-2 flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-2">
                            <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span>Settings</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                          onClick={() => setShowResources(!showResources)}
                          className="w-full px-3 py-2 flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-2">
                            <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span>Resources</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full px-3 py-2 flex items-center space-x-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-0">
        <Outlet />
      </main>
    </div>
  );
}