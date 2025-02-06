import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Camera, Save, Trash2, Eye, EyeOff, Sparkles } from 'lucide-react';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
  biography: string;
  tagline: string;
  role: 'DONOR' | 'BENEFICIARY' | 'MANAGER';
  city: string;
  visibility: boolean;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioLength, setBioLength] = useState(0);

  useEffect(() => {
    getProfile();
  }, []);

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
        setProfile(data);
        setBioLength(data?.biography?.length || 0);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  const bioExamples = [
    "Passionate donor turning unused treasures into community gold. Building bridges through giving, one item at a time. 🌟",
    "Community advocate with a mission to make a difference. Connecting resources with needs to create positive change. ✨",
    "Dedicated to sustainable living and community support. Making our world better through mindful sharing. 🌱"
  ];

  const generateBio = () => {
    const randomBio = bioExamples[Math.floor(Math.random() * bioExamples.length)];
    updateProfile({ biography: randomBio });
    setBioLength(randomBio.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <img
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white bg-white"
                />
                {editing && (
                  <button className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full text-white">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {editing ? (
              <button
                onClick={() => setEditing(false)}
                className="absolute top-4 right-4 px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50"
              >
                <Save className="w-4 h-4 inline-block mr-2" />
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="absolute top-4 right-4 px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-8">
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editing ? (
                    <input
                      type="text"
                      value={profile?.full_name || ''}
                      onChange={e => updateProfile({ full_name: e.target.value })}
                      className="w-full border-b border-gray-300 focus:border-blue-500 focus:ring-0"
                    />
                  ) : (
                    profile?.full_name
                  )}
                </h2>
                <p className="text-gray-500">@{profile?.username}</p>
              </div>

              {/* Role Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {profile?.role}
              </div>

              {/* Biography */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">About</label>
                  {editing && (
                    <button
                      onClick={generateBio}
                      className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Generate Bio
                    </button>
                  )}
                </div>
                {editing ? (
                  <div className="space-y-2">
                    <textarea
                      value={profile?.biography || ''}
                      onChange={e => {
                        updateProfile({ biography: e.target.value });
                        setBioLength(e.target.value.length);
                      }}
                      rows={4}
                      maxLength={240}
                      placeholder="Write a catchy bio that highlights your personality and achievements..."
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 text-right">
                      {bioLength}/240 characters
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {profile?.biography || 'No biography provided.'}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {editing ? (
                  <input
                    type="text"
                    value={profile?.city || ''}
                    onChange={e => updateProfile({ city: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">{profile?.city || 'No location provided.'}</p>
                )}
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Profile Visibility</span>
                <button
                  onClick={() => updateProfile({ visibility: !profile?.visibility })}
                  className={`flex items-center px-3 py-2 rounded-md ${
                    profile?.visibility
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {profile?.visibility ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Private
                    </>
                  )}
                </button>
              </div>

              {/* Delete Account */}
              <div className="pt-6 border-t border-gray-200">
                <button className="flex items-center text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}