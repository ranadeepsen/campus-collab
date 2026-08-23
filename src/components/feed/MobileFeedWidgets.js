"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { X, Trophy } from 'lucide-react';

export default function MobileFeedWidgets({ profile }) {
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [showAmbassadorPromo, setShowAmbassadorPromo] = useState(true);

  useEffect(() => {
    fetch('/api/events?limit=5', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUpcomingEvents(data);
      })
      .catch(console.error);
  }, []);

  const canBecomeAmbassador = profile?.access?.canBecomeAmbassador && profile?.ambassadorStatus !== 'active';

  return (
    <div className="lg:hidden flex flex-col gap-4 mb-4">
      
      {/* Ambassador Promo (Dismissible) */}
      {canBecomeAmbassador && showAmbassadorPromo && (
        <div className="bg-gradient-to-r from-[#5D22D7] to-[#8B4CFF] rounded-2xl p-4 text-white shadow-md relative">
          <button 
            onClick={() => setShowAmbassadorPromo(false)}
            className="absolute top-2 right-2 p-1 text-white/70 hover:text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Become an Ambassador</h4>
              <p className="text-xs text-purple-100 mt-0.5 mb-2">Represent your college and earn rewards!</p>
              <button 
                onClick={() => router.push('/ambassador/apply')}
                className="bg-white text-[#5D22D7] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events Horizontal Strip */}
      {upcomingEvents.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-sm text-gray-900">Upcoming Events</h3>
            <Link href="/events" className="text-xs font-semibold text-[#5D22D7]">View All</Link>
          </div>
          
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory custom-scrollbar -mx-4 px-4">
            {upcomingEvents.map(evt => {
              const dateObj = new Date(evt.dateTime);
              return (
                <Link 
                  key={evt._id}
                  href={/events?eventId=}
                  className="snap-start shrink-0 w-[240px] bg-white border border-gray-100 rounded-2xl p-3 shadow-sm flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F0EBFD] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-extrabold text-[#5D22D7] uppercase tracking-wider">{format(dateObj, 'MMM')}</span>
                    <span className="text-base font-extrabold text-[#5D22D7] leading-none">{format(dateObj, 'dd')}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{evt.name}</h4>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{evt.college?.name || 'All Colleges'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
