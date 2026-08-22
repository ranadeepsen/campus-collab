"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Settings, Camera, Music2, Users } from 'lucide-react';
import { format } from 'date-fns';
import ClubCard from '@/components/shared/ClubCard';

export default function RightSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const userType = user?.publicMetadata?.user_type;
  const canJoinClubs = userType === 'current' && user?.publicMetadata?.status === 'verified';
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [realClubs, setRealClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  
  useEffect(() => {
    fetch('/api/events?limit=3', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUpcomingEvents(data);
      })
      .catch(console.error);

    fetch('/api/clubs?limit=10', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRealClubs(data);
        setLoadingClubs(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingClubs(false);
      });
  }, []);


  if (pathname === '/clubs') {
    return (
      <div className="flex flex-col gap-5 select-none h-[calc(100vh-6rem)]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-base text-gray-900">Top 10 Clubs</h2>
            <span className="text-[10px] font-semibold bg-[#F0EBFD] text-[#5D22D7] px-2 py-0.5 rounded-full">Ranked</span>
          </div>
          
          <div className="divide-y divide-gray-100 overflow-y-auto flex-1 custom-scrollbar">
            {loadingClubs ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading rankings...</div>
            ) : realClubs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="font-medium text-sm">No clubs found.</p>
              </div>
            ) : (
              realClubs.slice(0, 10).map((club, index) => (
                <ClubCard key={club._id} club={club} index={index} isSidebar />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 select-none">
      
      {/* Upcoming Events */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-sm text-gray-900">Upcoming Events</h3>
          <Link href="/events" className="text-xs font-semibold text-[#5D22D7] hover:underline">
            View All
          </Link>
        </div>
        
        <div className="space-y-3.5">
          {upcomingEvents.length === 0 ? (
            <div className="text-xs text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-xl">No upcoming events</div>
          ) : upcomingEvents.map((evt) => {
            const dateObj = new Date(evt.dateTime);
            return (
              <Link 
                key={evt._id}
                href={`/events?eventId=${evt._id}`}
                className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Date Box */}
                <div className="w-12 h-13 rounded-xl bg-[#F0EBFD] border border-purple-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-[#5D22D7] group-hover:border-[#5D22D7] transition-colors">
                  <span className="text-[9px] font-extrabold text-[#5D22D7] group-hover:text-white uppercase tracking-wider transition-colors">{format(dateObj, 'MMM')}</span>
                  <span className="text-base font-extrabold text-[#5D22D7] group-hover:text-white leading-none transition-colors">{format(dateObj, 'dd')}</span>
                </div>
                
                {/* Event Details */}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-gray-900 truncate group-hover:text-[#5D22D7] transition-colors">{evt.name}</h4>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{evt.college?.name || 'TBA'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{format(dateObj, 'd MMM, h:mm a')}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Trending Clubs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-sm text-gray-900">Trending Clubs</h3>
          <Link href="/clubs" className="text-xs font-semibold text-[#5D22D7] hover:underline">
            View All
          </Link>
        </div>
        <div className="space-y-3.5 mt-2">
          {loadingClubs ? (
            <p className="text-xs text-gray-500">Loading clubs...</p>
          ) : realClubs.length === 0 ? (
            <p className="text-xs text-gray-500">No clubs yet.</p>
          ) : (
            realClubs.slice(0, 3).map((club, i) => {
              const membersCount = club.members ? club.members.filter(m => m.status === 'active' || m.role === 'admin').length : 0;
              return (
                <div key={club._id} className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100 bg-gray-50 overflow-hidden">
                      {club.logoUrl ? (
                        <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate group-hover:text-[#5D22D7] transition-colors">{club.name}</h4>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{club.college?.name || club.university || 'University'}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{membersCount} Members</p>
                    </div>
                  </div>

                  <Link
                    href={`/clubs/${club._id}`}
                    className="text-[10px] font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition-colors shrink-0 border border-gray-200"
                  >
                    View
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ambassador Promo Card */}
      <div className="bg-gradient-to-br from-[#5D22D7] via-[#6320EE] to-[#7B2CBF] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-[170px]">
          <h3 className="font-bold text-sm mb-1 leading-tight text-white">Become an Ambassador</h3>
          <p className="text-xs text-purple-100 leading-relaxed mb-4 font-normal">
            Earn points by helping other students.
          </p>
          <Link
            href="/mentors"
            className="inline-block bg-white text-[#5D22D7] font-bold text-xs px-5 py-2 rounded-xl shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Join Now
          </Link>
        </div>

        {/* 3D Trophy Graphic */}
        <div className="absolute right-2 bottom-1 w-28 h-28 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
            {/* Pedestal */}
            <ellipse cx="60" cy="100" rx="35" ry="10" fill="#4C1D95" opacity="0.6" />
            <path d="M35 95 L85 95 L78 108 L42 108 Z" fill="#6B21A8" />
            <path d="M45 80 L75 80 L80 95 L40 95 Z" fill="#7E22CE" />
            
            {/* Cup Stem & Base */}
            <path d="M55 70 L65 70 L65 80 L55 80 Z" fill="#EAB308" />
            
            {/* Gold Trophy Cup */}
            <path d="M36 32 C36 62 84 62 84 32 Z" fill="#FACC15" />
            <ellipse cx="60" cy="32" rx="24" ry="6" fill="#FDE047" />
            
            {/* Trophy Handles */}
            <path d="M36 36 C24 36 24 52 38 52" fill="none" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />
            <path d="M84 36 C96 36 96 52 82 52" fill="none" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />
            
            {/* Star on Cup */}
            <polygon points="60,40 62,45 67,45 63,48 65,53 60,50 55,53 57,48 53,45 58,45" fill="#CA8A04" />
            
            {/* Sparkles */}
            <circle cx="85" cy="22" r="2.5" fill="#FEF08A" />
            <circle cx="28" cy="28" r="2" fill="#FEF08A" />
            <circle cx="95" cy="45" r="1.5" fill="#FEF08A" />
          </svg>
        </div>
      </div>

    </div>
  );
}
