"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { Settings, Headphones, LogOut, Bookmark, GraduationCap } from 'lucide-react';

export default function MobileProfilePage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/users/me/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProfile(data);
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      await signOut({ redirectUrl: '/sign-in' });
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  const quickLinks = [
    { icon: GraduationCap, label: 'Mentorship', href: '/mentors' },
    { icon: Bookmark, label: 'Saved Posts', href: '/saved' },
    { icon: Headphones, label: 'Help & Support', href: '/support' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6 pb-6">
      <h1 className="text-2xl font-bold text-gray-900 px-2">Profile</h1>
      
      {/* Profile Card */}
      <Link href="/settings/profile" className="bg-gradient-to-br from-[#5D22D7] via-[#6320EE] to-[#7B2CBF] rounded-2xl p-5 text-white shadow-md block hover:shadow-lg transition-all group mx-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/40 shrink-0 shadow-sm bg-purple-800">
            {isLoaded ? (
              <img 
                src={profile?.profile?.photo || user?.imageUrl || "/default-avatar.png"} 
                alt={user?.fullName || "User"} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full animate-pulse bg-white/20" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base leading-tight truncate text-white">
                {profile?.profile?.name || user?.fullName || 'Loading...'}
              </h3>
              {profile?.ambassadorStatus === 'active' && (
                <span className="bg-white text-[#5D22D7] text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0">
                  Ambassador
                </span>
              )}
            </div>
            <p className="text-xs text-purple-200 mt-1 font-medium leading-snug line-clamp-1">
              {profile?.profile?.college?.name || 'No College Selected'}
            </p>
            <p className="text-[11px] text-purple-200/80 truncate mt-0.5">
              {profile?.profile?.yearOfStudy ? `${profile.profile.yearOfStudy}, ` : ''}
              {profile?.profile?.department || ''}
            </p>
          </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 pt-4 border-t border-white/20 text-center gap-2">
          <div>
            <div className="text-xs font-medium text-purple-200 mb-1">Posts</div>
            <div className="font-extrabold text-lg text-white">{profile?.stats?.posts || 0}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-purple-200 mb-1">Connects</div>
            <div className="font-extrabold text-lg text-white">{profile?.stats?.connections || 0}</div>
          </div>
          {profile?.ambassadorStatus === 'active' ? (
            <div>
              <div className="text-xs font-medium text-purple-200 mb-1">Points</div>
              <div className="font-extrabold text-lg text-white">{profile?.stats?.points || 0}</div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/ambassador/apply'); }}
                className="text-[10px] font-bold bg-white/20 px-3 py-1.5 rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                Be Ambassador
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Links List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mx-2 overflow-hidden divide-y divide-gray-100">
        {quickLinks.map((link) => (
          <Link 
            key={link.label}
            href={link.href}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-gray-50 rounded-xl">
              <link.icon className="w-5 h-5 text-gray-500" />
            </div>
            <span className="font-medium text-gray-900">{link.label}</span>
          </Link>
        ))}
        
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 transition-colors group"
        >
          <div className="p-2 bg-red-50 group-hover:bg-red-100 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-medium text-red-600">{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
        </button>
      </div>
    </div>
  );
}
