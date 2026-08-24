"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Home, Building2, MessageSquare, Compass, Calendar, UserPlus, GraduationCap } from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/users/me/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProfile(data);
      })
      .catch(console.error);
  }, []);

  const isProspective = profile?.user_type === 'prospective';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-[70px] px-1 relative">
        
        {/* Feed is visible to everyone */}
        <Link 
          href="/"
          className={clsx(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            pathname === '/' ? "text-[#5D22D7]" : "text-gray-400 hover:text-gray-900"
          )}
        >
          <Home className={clsx("w-[22px] h-[22px]", pathname === '/' && "fill-[#5D22D7]/10")} strokeWidth={pathname === '/' ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Home</span>
        </Link>

        {!isProspective ? (
          <>
            {/* Hub */}
            <Link 
              href="/hub"
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                pathname.startsWith('/hub') ? "text-[#5D22D7]" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <Building2 className={clsx("w-[22px] h-[22px]", pathname.startsWith('/hub') && "fill-[#5D22D7]/10")} strokeWidth={pathname.startsWith('/hub') ? 2.5 : 2} />
              <span className="text-[9px] font-medium">Hub</span>
            </Link>

            {/* Clubs */}
            <Link 
              href="/clubs"
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                pathname.startsWith('/clubs') ? "text-[#5D22D7]" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <Compass className={clsx("w-[22px] h-[22px]", pathname.startsWith('/clubs') && "fill-[#5D22D7]/10")} strokeWidth={pathname.startsWith('/clubs') ? 2.5 : 2} />
              <span className="text-[9px] font-medium">Clubs</span>
            </Link>

            {/* Events */}
            <Link 
              href="/events"
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                pathname.startsWith('/events') ? "text-[#5D22D7]" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <Calendar className={clsx("w-[22px] h-[22px]", pathname.startsWith('/events') && "fill-[#5D22D7]/10")} strokeWidth={pathname.startsWith('/events') ? 2.5 : 2} />
              <span className="text-[9px] font-medium">Events</span>
            </Link>

            {/* Connections */}
            <Link 
              href="/connections"
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                pathname.startsWith('/connections') ? "text-[#5D22D7]" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <UserPlus className={clsx("w-[22px] h-[22px]", pathname.startsWith('/connections') && "fill-[#5D22D7]/10")} strokeWidth={pathname.startsWith('/connections') ? 2.5 : 2} />
              <span className="text-[9px] font-medium">Connections</span>
            </Link>
          </>
        ) : (
          <>
            {/* Ambassadors */}
            <Link 
              href="/mentors"
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                pathname.startsWith('/mentors') ? "text-[#5D22D7]" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <GraduationCap className={clsx("w-[22px] h-[22px]", pathname.startsWith('/mentors') && "fill-[#5D22D7]/10")} strokeWidth={pathname.startsWith('/mentors') ? 2.5 : 2} />
              <span className="text-[9px] font-medium">Mentors</span>
            </Link>
            
            {/* Connections */}
            <Link 
              href="/connections"
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                pathname.startsWith('/connections') ? "text-[#5D22D7]" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <UserPlus className={clsx("w-[22px] h-[22px]", pathname.startsWith('/connections') && "fill-[#5D22D7]/10")} strokeWidth={pathname.startsWith('/connections') ? 2.5 : 2} />
              <span className="text-[9px] font-medium">Connections</span>
            </Link>
          </>
        )}

        {/* Chat / Messages */}
        <Link 
          href="/messages"
          className={clsx(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            pathname.startsWith('/messages') ? "text-[#5D22D7]" : "text-gray-400 hover:text-gray-900"
          )}
        >
          <MessageSquare className={clsx("w-[22px] h-[22px]", pathname.startsWith('/messages') && "fill-[#5D22D7]/10")} strokeWidth={pathname.startsWith('/messages') ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Chat</span>
        </Link>
      </div>
    </div>
  );
}
