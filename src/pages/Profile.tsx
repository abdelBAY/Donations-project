import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { 
  Camera, 
  Save, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles,
  Moon,
  Sun,
  Settings,
  HelpCircle,
  LogOut,
  Copy,
  ChevronDown
} from 'lucide-react';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
  biography: string;
  tagline: string;
  role: 'DONOR' | 'BENEFICIARY' | 'MANAGER';
  city: string;
  visibility: boolean;
  connect_id?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioLength, setBioLength] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);
  const setStoreUser = useStore((state) => state.setUser);

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    // Apply dark mode to body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile({
          ...data,
          connect_id: user.id
        });
        setBioLength(data?.biography?.length || 0);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCopyId = () => {
    if (profile?.connect_id) {
      navigator.clipboard.writeText(profile.connect_id);
      // You could add a notification here
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (confirmed) {
      await supabase.auth.signOut();
      setStoreUser(null);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Connect ID Section */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Your Connect ID
              </h2>
              <div className="flex items-center justify-center space-x-2">
                <code className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200">
                  {profile?.connect_id}
                </code>
                <button
                  onClick={handleCopyId}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
                <span className="text-gray-700 dark:text-gray-200">Dark Mode</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Settings Section */}
            <div className="space-y-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${showSettings ? 'rotate-180' : ''}`} />
              </button>
              {showSettings && (
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg ml-8">
                  {/* Add your settings options here */}
                  <div className="space-y-4">
                    <button className="w-full text-left text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      Account Settings
                    </button>
                    <button className="w-full text-left text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      Privacy Settings
                    </button>
                    <button className="w-full text-left text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      Notification Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Resources Section */}
            <div className="space-y-2">
              <button
                onClick={() => setShowResources(!showResources)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5" />
                  <span>Resources</span>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${showResources ? 'rotate-180' : ''}`} />
              </button>
              {showResources && (
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg ml-8">
                  <div className="space-y-4">
                    <button className="w-full text-left text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      Help Center
                    </button>
                    <button className="w-full text-left text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      Documentation
                    </button>
                    <button className="w-full text-left text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      Contact Support
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}