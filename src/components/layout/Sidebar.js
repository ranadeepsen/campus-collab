"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { Home, Landmark, Calendar, Users, UserPlus, GraduationCap, MessageSquare, Bookmark, Headphones, Settings, LogOut, Loader2, AlertCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const user_type = user?.publicMetadata?.user_type;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = () => {
      fetch('/api/users/me/profile')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setProfile(data);
        })
        .catch(console.error);
    };

    fetchProfile();

    if (typeof window !== 'undefined') {
      window.addEventListener('user-stats-updated', fetchProfile);
      return () => window.removeEventListener('user-stats-updated', fetchProfile);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (storageErr) {
          console.warn('Failed to clear storage:', storageErr);
        }
      }
      await signOut({ redirectUrl: '/sign-in' });
    } catch (err) {
      console.error('Logout error:', err);
      setLogoutError('Failed to log out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  const allNavItems = [
    { icon: Home, label: 'Feed', href: '/' },
    { icon: Landmark, label: 'Campus Hub', href: '/hub' },
    { icon: UserPlus, label: 'Connections', href: '/connections' },
    { icon: Calendar, label: 'Events', href: '/events' },
    { icon: Users, label: 'Clubs & Societies', href: '/clubs' },
    { icon: GraduationCap, label: 'Ambassadors', href: '/mentors' },
    { icon: MessageSquare, label: 'Messages', href: '/messages' },
    { icon: Bookmark, label: 'Saved', href: '/saved' },
  ];

  const navItems = user_type === 'prospective' 
    ? allNavItems.filter(item => ['Feed', 'Ambassadors', 'Connections', 'Messages'].includes(item.label))
    : allNavItems;

  const quickLinks = [
    { icon: Headphones, label: 'Help & Support', href: '/support' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: LogOut, label: 'Log Out', isLogout: true },
  ];

  return (
    <div className="flex flex-col gap-3 select-none h-[calc(100vh-3rem)]">
      {/* Sidebar Logo Header */}
      <div className="px-2 py-1 mb-0.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img 
            src="/photos/full-logo.png" 
            alt="Campus Collab" 
            className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-85"
          />
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center justify-between px-4 py-2.5 rounded-[16px] transition-all font-semibold text-sm ${
                isActive 
                  ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-[var(--shadow-soft)]' 
                  : 'text-[var(--text-main)] hover:text-[var(--primary)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={`w-5 h-5 ${isActive ? '' : 'text-[var(--muted)] group-hover:text-[var(--primary)]'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                  isActive ? 'bg-white text-[var(--primary)]' : 'bg-[var(--primary)] text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Card */}
      <Link href="/settings/profile" className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent-pink)] rounded-[20px] p-4 text-white shadow-[var(--shadow-soft)] mt-2 block hover:shadow-lg transition-all group">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/40 shrink-0 shadow-sm bg-[var(--primary-dark)]">
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
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm leading-tight truncate text-white">
                {profile?.profile?.name || user?.fullName || 'Loading...'}
              </h3>
              {profile?.ambassadorStatus === 'active' && (
                <span className="bg-white text-[var(--primary)] text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">
                  Ambassador
                </span>
              )}
            </div>
            <p className="text-[11px] text-purple-200 mt-0.5 font-medium leading-snug line-clamp-1">
              {profile?.profile?.college?.name || 'No College'}
            </p>
            <p className="text-[10px] text-purple-200/80 truncate mt-0.5">
              {profile?.profile?.yearOfStudy ? `${profile.profile.yearOfStudy}, ` : ''}
              {profile?.profile?.department || ''}
            </p>
          </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid pt-3 border-t border-white/20 text-center gap-1 ${profile?.ambassadorStatus === 'active' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div>
            <div className="text-[11px] font-medium text-purple-200 mb-0.5">Posts</div>
            <div className="font-extrabold text-sm text-white">{profile?.stats?.posts || 0}</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-purple-200 mb-0.5">Connects</div>
            <div className="font-extrabold text-sm text-white">{profile?.stats?.connections || 0}</div>
          </div>
          {profile?.ambassadorStatus === 'active' ? (
            <div>
              <div className="text-[11px] font-medium text-purple-200 mb-0.5">Points</div>
              <div className="font-extrabold text-sm text-white">{profile?.stats?.points || 0}</div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/ambassador/apply'); }}
                className="text-[9px] font-bold bg-white/20 px-2 py-1 rounded text-white hover:bg-white/30 transition-colors"
              >
                Be Ambassador
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Quick Links Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[20px] p-3.5 shadow-[var(--shadow-soft)] mt-auto">
        <h4 className="font-bold text-xs text-[var(--text-main)] mb-2.5 px-1">Quick Links</h4>
        <div className="grid grid-cols-3 gap-2">
          {quickLinks.map((link) => {
            const ButtonOrLink = link.isLogout ? 'button' : Link;
            const props = link.isLogout ? {
              type: 'button',
              onClick: () => {
                setLogoutError(null);
                setShowConfirmModal(true);
              }
            } : { href: link.href };

            return (
              <ButtonOrLink 
                key={link.label} 
                {...props}
                className="group flex flex-col items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all text-center cursor-pointer border-none bg-transparent"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--primary)] group-hover:scale-105 transition-transform shadow-xs">
                  <link.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 group-hover:text-[var(--primary)] leading-tight text-center">
                  {link.label}
                </span>
              </ButtonOrLink>
            );
          })}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowConfirmModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-10 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center mb-3">
                  <LogOut className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Log out of Campus Collab?
                </h3>
                <p className="text-xs text-gray-500 mb-5 max-w-[260px]">
                  You will be returned to the sign-in screen. You can sign back in anytime.
                </p>

                {logoutError && (
                  <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{logoutError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--primary)] hover:bg-[#4C1D95] active:bg-[#3B1278] text-white font-bold text-xs shadow-[0_4px_14px_rgba(93,34,215,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <span>Log Out</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


