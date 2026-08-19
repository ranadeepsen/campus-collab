"use client";

import { useRouter } from 'next/navigation';
import { Search, Bell, MessageSquare, Plus } from 'lucide-react';
import { UserButton, ClerkLoading, ClerkLoaded, useUser } from '@clerk/nextjs';

export default function TopBar() {
  const router = useRouter();
  const { user } = useUser();
  const userType = user?.publicMetadata?.user_type;
  const canPost = userType === 'current' && user?.publicMetadata?.status === 'verified';

  const scrollToComposer = () => {
    const composer = document.getElementById('post-composer');
    if (composer) {
      composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      composer.querySelector('textarea')?.focus();
      return;
    }
    router.push('/#post-composer');
  };

  return (
    <header className="w-full flex items-center justify-between gap-4">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#5D22D7] transition-colors" />
          <input 
            type="text" 
            placeholder="Search for people, clubs, events..." 
            className="w-full bg-white border border-gray-200/80 hover:border-gray-300 focus:border-[#5D22D7] focus:ring-4 focus:ring-[#5D22D7]/10 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none transition-all text-gray-900 placeholder:text-gray-400 shadow-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {canPost && (
          <button 
            type="button"
            onClick={scrollToComposer}
            className="flex items-center gap-2 bg-[#5D22D7] hover:bg-[#4C1D95] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(93,34,215,0.25)] hover:shadow-[0_6px_20px_rgba(93,34,215,0.35)] cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Create Post</span>
          </button>
        )}

        <button 
          type="button"
          onClick={() => router.push('/notifications')}
          className="relative p-2.5 text-gray-600 hover:text-[#5D22D7] hover:bg-[#F0EBFD]/60 rounded-full transition-colors cursor-pointer border border-transparent hover:border-[#5D22D7]/20"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        
        {userType !== 'prospective' && (
          <button 
            type="button"
            onClick={() => router.push('/messages')}
            className="p-2.5 text-gray-600 hover:text-[#5D22D7] hover:bg-[#F0EBFD]/60 rounded-full transition-colors cursor-pointer border border-transparent hover:border-[#5D22D7]/20 hidden sm:block"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}
        
        <div className="pl-1 flex items-center justify-center">
          <ClerkLoading>
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse border border-gray-200 shadow-xs" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: "w-9 h-9 border border-gray-200 shadow-xs" } }} />
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
}
