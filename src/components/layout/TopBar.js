"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, MessageSquare, X } from 'lucide-react';
import { UserButton, ClerkLoading, ClerkLoaded, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const userType = user?.publicMetadata?.user_type;
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef(null);

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
    // Only apply on the feed page
    if (pathname !== '/') return;

    const delayDebounceFn = setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if (searchTerm) {
        urlParams.set('q', searchTerm);
      } else {
        urlParams.delete('q');
      }
      
      const newUrl = ${pathname};
      // Use replace so we don't spam the browser history
      router.replace(newUrl, { scroll: false });
    }, 400); // 400ms debounce

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

  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  return (
    <>
      <header className="w-full flex items-center justify-between gap-4">
        
        {/* Mobile Logo (Left) */}
        <div className="lg:hidden shrink-0 flex items-center">
          <Link href="/" className="font-bold text-[#5D22D7] text-xl">Campus Collab</Link>
        </div>

        {/* Desktop Search (Center) */}
        <div className="flex-1 max-w-2xl hidden lg:block">
          {pathname === '/' && (
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#5D22D7] transition-colors" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for people, clubs, events..." 
                className="w-full bg-white border border-gray-200/80 hover:border-gray-300 focus:border-[#5D22D7] focus:ring-4 focus:ring-[#5D22D7]/10 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none transition-all text-gray-900 placeholder:text-gray-400 shadow-xs"
              />
            </div>
          )}
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Mobile Search Icon */}
          <button 
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="lg:hidden relative p-2.5 text-gray-600 hover:text-[#5D22D7] hover:bg-[#F0EBFD]/60 rounded-full transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button 
            type="button"
            onClick={() => router.push('/notifications')}
            className="relative p-2.5 text-gray-600 hover:text-[#5D22D7] hover:bg-[#F0EBFD]/60 rounded-full transition-colors cursor-pointer border border-transparent hover:border-[#5D22D7]/20"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {userType !== 'prospective' && (
            <button 
              type="button"
              onClick={() => router.push('/messages')}
              className="p-2.5 text-gray-600 hover:text-[#5D22D7] hover:bg-[#F0EBFD]/60 rounded-full transition-colors cursor-pointer border border-transparent hover:border-[#5D22D7]/20 hidden lg:block"
              aria-label="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
          
          {/* Avatar hidden on mobile (handled by BottomBar instead) */}
          <div className="pl-1 hidden lg:flex items-center justify-center">
            <ClerkLoading>
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse border border-gray-200 shadow-xs" />
            </ClerkLoading>
            <ClerkLoaded>
              <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: "w-9 h-9 border border-gray-200 shadow-xs" } }} />
            </ClerkLoaded>
          </div>
        </div>
      </header>

      {/* Mobile Search Full-Screen Overlay */}
      {isMobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-[110] bg-white animate-in fade-in duration-200 flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#5D22D7]" />
              <input 
                ref={mobileInputRef}
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..." 
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#5D22D7] focus:bg-white rounded-xl py-3 pl-11 pr-4 text-base outline-none transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {/* Search results would go here if we implemented a dedicated search view.
                For now, typing updates the URL, so it works seamlessly on the feed. */}
            <p className="text-gray-400 text-sm text-center mt-10">Start typing to search...</p>
          </div>
        </div>
      )}
    </>
  );
}
