"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Settings, Shield, User, ArrowRight, Loader2, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const accountType = user?.publicMetadata?.user_type === 'prospective'
    ? 'Prospective Student'
    : 'Current Student';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="bg-[#5D22D7] rounded-3xl p-8 sm:p-10 shadow-sm text-white">
        <div className="flex items-center gap-4 mb-2">
          <Settings className="w-10 h-10 text-white/90" />
          <h1 className="text-3xl font-extrabold">Settings</h1>
        </div>
        <p className="text-white/80 max-w-xl">Manage your account, profile preferences, and security settings.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Overview */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-[#5D22D7]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-sm text-gray-500">Update your public information</p>
                  </div>
                </div>
                <Link
                  href="/settings/profile"
                  className="hidden sm:flex items-center gap-2 bg-[#5D22D7] hover:bg-[#4C1D95] text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                >
                  Edit Profile <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Display Name</p>
                  <p className="font-semibold text-gray-900 text-lg truncate">{profile?.profile?.name || user?.fullName || 'Not set'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</p>
                  <p className="font-semibold text-gray-900 truncate">{profile?.email || user?.primaryEmailAddress?.emailAddress}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Account Type</p>
                  <p className="font-semibold text-gray-900">{accountType}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Verification Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${profile?.status === 'verified' ? 'bg-green-500' : profile?.status === 'pending_review' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                    <p className="font-semibold text-gray-900 capitalize">{profile?.status || user?.publicMetadata?.status || 'unverified'}</p>
                  </div>
                </div>
              </div>
              
              <Link
                href="/settings/profile"
                className="sm:hidden mt-6 flex items-center justify-center gap-2 w-full bg-[#5D22D7] text-white px-4 py-3 rounded-xl font-bold transition-colors"
              >
                Edit Profile <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-500">Manage your email and push alerts</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-900">Email Notifications</h4>
                  <p className="text-xs text-gray-500">Receive weekly digests and updates</p>
                </div>
                <div className="w-12 h-6 bg-[#5D22D7] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-sm">
              <Shield className="w-10 h-10 text-white/80 mb-4" />
              <h2 className="text-xl font-bold mb-2">Security & Login</h2>
              <p className="text-white/70 text-sm mb-6">Update your password, manage connected devices, or configure two-factor authentication.</p>
              
              {/* Clerk's user profile component handles security, we can just link to it or instruct */}
              <button 
                onClick={() => window.open(window.location.origin + '/sign-in', '_blank')}
                className="w-full bg-white text-black hover:bg-gray-100 py-3 rounded-xl font-bold transition-colors text-sm"
              >
                Manage Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
