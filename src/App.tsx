import React, { useEffect } from 'react';
import { Gift, MessageCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './lib/store';

function App() {
  const navigate = useNavigate();
  const setDarkMode = useStore((state) => state.setDarkMode);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  const handleStartDonating = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-50 via-light to-light-50 dark:from-dark dark:via-dark-50 dark:to-dark transition-colors duration-300">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-light-900 dark:text-light-50 sm:text-5xl md:text-6xl tracking-tight">
            Connect, Share, <span className="text-blue-600 dark:text-blue-400 inline-block">Make a Difference</span>
          </h1>
          <p className="mt-6 max-w-md mx-auto text-lg text-light-600 dark:text-light-300 sm:text-xl md:mt-8 md:max-w-3xl">
            Join our community where giving meets receiving. Make a positive impact by sharing what you no longer need with those who need it most.
          </p>
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10">
            <button
              onClick={handleStartDonating}
              className="btn-primary w-full sm:w-auto flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg md:text-xl md:px-12 transform hover:-translate-y-0.5"
            >
              <Gift className="w-6 h-6 mr-2" />
              Start Donating
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              {
                icon: Gift,
                title: 'Easy Donations',
                description: 'Create listings for items you want to donate with just a few clicks'
              },
              {
                icon: MessageCircle,
                title: 'Direct Communication',
                description: 'Chat directly with donors or beneficiaries to coordinate donations'
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                description: 'Get notified about new matching items and message updates'
              }
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-dark-100 text-blue-600 dark:text-blue-400">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-light-600 dark:text-light-300">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-dark-200 dark:to-dark-300">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to make a difference?
            </h2>
            <p className="mt-4 text-xl text-blue-100 dark:text-light-300">
              Join thousands of others who are already making an impact in their communities.
            </p>
            <button
              onClick={handleStartDonating}
              className="mt-8 inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-white dark:bg-dark-50 hover:bg-blue-50 dark:hover:bg-dark-100 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;