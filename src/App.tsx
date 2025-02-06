import React from 'react';
import { Gift, MessageCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const handleStartDonating = () => {
    navigate('/register');
  };

  return (
    <>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl tracking-tight">
            Connect, Share, <span className="text-blue-600 inline-block">Make a Difference</span>
          </h1>
          <p className="mt-6 max-w-md mx-auto text-lg text-gray-600 sm:text-xl md:mt-8 md:max-w-3xl">
            Join our community where giving meets receiving. Make a positive impact by sharing what you no longer need with those who need it most.
          </p>
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10">
            <div className="rounded-md shadow-lg">
              <button
                onClick={handleStartDonating}
                aria-label="Start donating items"
                className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:text-xl md:px-12 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-800"
                role="link"
              >
                <Gift className="w-6 h-6 mr-2" aria-hidden="true" />
                Start Donating
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex flex-col items-center text-center group">
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1">
                <Gift className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Easy Donations</h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Create listings for items you want to donate with just a few clicks
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Direct Communication</h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Chat directly with donors or beneficiaries to coordinate donations
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1">
                <Bell className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Smart Notifications</h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Get notified about new matching items and message updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to make a difference?
            </h2>
            <p className="mt-4 text-xl leading-7 text-blue-100">
              Join thousands of others who are already making an impact in their communities.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-lg shadow-xl">
                <button
                  onClick={handleStartDonating}
                  aria-label="Get started with donation"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-100"
                  role="link"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;