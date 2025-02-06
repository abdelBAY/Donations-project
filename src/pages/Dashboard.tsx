import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle, BookmarkPlus, Activity, PlusCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface DashboardItem {
  id: string;
  title: string;
  status: 'PENDING' | 'CLAIMED' | 'COMPLETED';
  created_at: string;
}

interface Profile {
  role: 'DONOR' | 'BENEFICIARY' | 'MANAGER';
}

export default function Dashboard() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            username: email?.split('@')[0] || '',
            full_name: user.user_metadata.full_name || '',
            role: user.user_metadata.role || 'DONOR',
            biography: '',
            city: '',
            visibility: true,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata.full_name || '')}&background=random`
          }])
          .select('role')
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      if (profileData?.role === 'DONOR' || (!profileData && user.user_metadata.role === 'DONOR')) {
        const { data, error: itemsError } = await supabase
          .from('announcements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (itemsError) throw itemsError;
        setItems(data || []);
      } else if (profileData?.role === 'BENEFICIARY' || (!profileData && user.user_metadata.role === 'BENEFICIARY')) {
        const { data, error: wishlistError } = await supabase
          .from('wishlists')
          .select('announcements(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (wishlistError) throw wishlistError;
        setItems(data?.map(item => item.announcements) || []);
      } else if (profileData?.role === 'MANAGER') {
        const { data, error: logsError } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (logsError) throw logsError;
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              {profile?.role === 'DONOR' && 'Track your donations and their status'}
              {profile?.role === 'BENEFICIARY' && 'View your saved items and requests'}
              {profile?.role === 'MANAGER' && 'Monitor user activity and moderate content'}
            </p>
          </div>
          {(profile?.role === 'DONOR' || profile?.role === 'BENEFICIARY') && (
            <Link
              to="/create-item"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Item
            </Link>
          )}
        </div>

        {/* Dashboard Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {profile?.role === 'DONOR' && (
            <div className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-gray-500 mb-4">No donations yet.</div>
                  <Link
                    to="/create-item"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create Your First Donation
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`
                        rounded-full p-2 mr-4
                        ${item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : ''}
                        ${item.status === 'CLAIMED' ? 'bg-blue-100 text-blue-600' : ''}
                        ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : ''}
                      `}>
                        {item.status === 'PENDING' && <Clock className="w-5 h-5" />}
                        {item.status === 'CLAIMED' && <CheckCircle className="w-5 h-5" />}
                        {item.status === 'COMPLETED' && <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">
                          Created on {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${item.status === 'CLAIMED' ? 'bg-blue-100 text-blue-800' : ''}
                      ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {profile?.role === 'BENEFICIARY' && (
            <div className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-gray-500 mb-4">No saved items yet.</div>
                  <Link
                    to="/create-item"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create Your First Request
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <BookmarkPlus className="w-5 h-5 text-blue-600 mr-4" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">
                          Saved on {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Contact Donor
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {profile?.role === 'MANAGER' && (
            <div className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No activity logs to display.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center">
                    <Activity className="w-5 h-5 text-gray-400 mr-4" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.action}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      <pre className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {JSON.stringify(item.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}