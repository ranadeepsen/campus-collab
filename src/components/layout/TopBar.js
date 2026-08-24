"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, MessageSquare, PanelRight } from 'lucide-react';
import { UserButton, ClerkLoading, ClerkLoaded, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function TopBar({ onOpenRightSidebar }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const userType = user?.publicMetadata?.user_type;
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync searchTerm with URL on load (optional)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) setSearchTerm(q);
    }
  }, [pathname]);

  // Debounce search input and update URL
  useEffect(() => {
    if (pathname !== '/') return;

    const delayDebounceFn = setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if (searchTerm) {
        urlParams.set('q', searchTerm);
      } else {
        urlParams.delete('q');
      }
      
      const newUrl = `${pathname}?${urlParams.toString()}`;
      router.replace(newUrl, { scroll: false });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoaded, user]);

  return (
    <header className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[var(--shadow-soft)] rounded-[20px] sticky top-4 z-50">
      
      {/* Desktop Logo (Left) */}
      <div className="hidden lg:flex shrink-0 items-center">
        <Link href="/" className="font-bold text-[var(--primary)] text-xl">Campus Collab</Link>
      </div>

      {/* Search Bar (Center/Left on mobile) */}
      <div className="flex-1 w-full max-w-2xl">
        {pathname === '/' && (
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for people, clubs, events..." 
              className="w-full bg-white/60 border border-white/50 hover:bg-white/80 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 rounded-full py-2.5 pl-11 pr-4 text-sm outline-none transition-all text-gray-900 placeholder-[var(--muted)] shadow-sm backdrop-blur-sm"
            />
          </div>
        )}
      </div>

      {/* Action Buttons (Right) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        
        {/* Notifications */}
        <button 
          type="button"
          onClick={() => router.push('/notifications')}
          className="relative p-2 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-white/50 rounded-full transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-[22px] h-[22px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          )}
        </button>
        
        {/* Messages (Desktop Only) */}
        {userType !== 'prospective' && (
          <button 
            type="button"
            onClick={() => router.push('/messages')}
            className="hidden lg:block p-2 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-white/50 rounded-full transition-colors cursor-pointer"
            aria-label="Messages"
          >
            <MessageSquare className="w-[22px] h-[22px]" />
          </button>
        )}

        {/* Right Sidebar Toggle (Mobile Only) */}
        <button 
          type="button"
          onClick={onOpenRightSidebar}
          className="lg:hidden p-2 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-white/50 rounded-full transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <PanelRight className="w-[22px] h-[22px]" />
        </button>
        
        {/* Avatar (Mobile and Desktop) */}
        <div className="pl-2 flex items-center justify-center">
          <ClerkLoading>
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse border-2 border-[var(--primary-light)]" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-[var(--primary-light)] rounded-full shadow-sm" } }} />
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
}
