import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Gift, Globe, LogOut } from 'lucide-react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const [isLanguageOpen, setIsLanguageOpen] = React.useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();

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

  const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ur', name: 'اردو' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <nav className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <Gift className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BladiShare</span>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                >
                  <Globe className="h-5 w-5" />
                  <span>Language</span>
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-out scale-100 opacity-100">
                    <div className="py-1" role="menu">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
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
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
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

      <main>
        <Outlet />
      </main>
    </div>
  );
}