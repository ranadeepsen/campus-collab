"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Settings, Camera, Music2 } from 'lucide-react';

export default function RightSidebar() {
  const router = useRouter();
  const { user } = useUser();
  const userType = user?.publicMetadata?.user_type;
  const canJoinClubs = userType === 'current' && user?.publicMetadata?.status === 'verified';
  const events = [
    { month: 'MAY', day: '24', title: 'TechNova 2K25', university: 'IIT Delhi', time: '24 May, 10:00 AM' },
    { month: 'MAY', day: '31', title: 'Cultural Night', university: 'Jadavpur University', time: '31 May, 06:00 PM' },
    { month: 'JUN', day: '07', title: 'Code Clash', university: 'NIT Surathkal', time: '7 June, 11:00 AM' },
  ];

  const clubs = [
    { 
      name: 'Robotics Club', 
      university: 'IIT Bombay', 
      members: '1.2k Members', 
      icon: Settings,
      iconBg: 'bg-slate-900 text-blue-400' 
    },
    { 
      name: 'Photography Club', 
      university: 'Delhi University', 
      members: '982 Members', 
      icon: Camera,
      iconBg: 'bg-zinc-900 text-white' 
    },
    { 
      name: 'Music Society', 
      university: 'Jadavpur University', 
      members: '1.1k Members', 
      icon: Music2,
      iconBg: 'bg-slate-900 text-pink-400' 
    },
  ];

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
          {events.map((evt, i) => (
            <div key={i} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 min-w-0">
                {/* Date Box */}
                <div className="w-12 h-13 rounded-xl bg-[#F0EBFD] border border-purple-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-extrabold text-[#5D22D7] uppercase tracking-wider">{evt.month}</span>
                  <span className="text-base font-extrabold text-[#5D22D7] leading-none">{evt.day}</span>
                </div>
                
                {/* Event Details */}
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-gray-900 truncate group-hover:text-[#5D22D7] transition-colors">{evt.title}</h4>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{evt.university}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{evt.time}</p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => router.push('/events')}
                className="text-xs font-semibold text-gray-700 hover:text-[#5D22D7] border border-gray-200 hover:border-[#5D22D7] px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                View Events
              </button>
            </div>
          ))}
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
        
        <div className="space-y-3.5">
          {clubs.map((club, i) => (
            <div key={i} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 min-w-0">
                {/* Club Icon */}
                <div className={`w-10 h-10 rounded-full ${club.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                  <club.icon className="w-5 h-5" />
                </div>
                
                {/* Club Details */}
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-gray-900 truncate group-hover:text-[#5D22D7] transition-colors">{club.name}</h4>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{club.university}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{club.members}</p>
                </div>
              </div>

              <Link
                href={canJoinClubs ? '/clubs' : '/clubs'}
                className={`text-xs font-semibold border px-4 py-1.5 rounded-xl transition-colors shrink-0 ${canJoinClubs ? 'text-gray-700 hover:text-[#5D22D7] border-gray-200 hover:border-[#5D22D7]' : 'text-gray-400 border-gray-100 pointer-events-none'}`}
              >
                {canJoinClubs ? 'Browse' : 'Locked'}
              </Link>
            </div>
          ))}
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
