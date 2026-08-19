"use client";

import { useState } from 'react';
import { Calendar, Users, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useUser } from '@clerk/nextjs';

export default function EventCard({ event }) {
  const { user } = useUser();
  const isProspective = user?.publicMetadata?.user_type === 'prospective';
  const [rsvps, setRsvps] = useState(event.rsvpIds?.length || 0);
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRSVP = async () => {
    if (isProspective) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event._id}/rsvp`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvpCount);
        setIsRSVPed(data.isRSVPed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const eventDate = new Date(event.dateTime);

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex gap-4">
      <div className="flex flex-col items-center justify-center w-16 h-16 bg-accent-soft rounded-xl shrink-0 border border-primary/10">
        <span className="text-xs text-primary font-bold uppercase">{format(eventDate, 'MMM')}</span>
        <span className="text-xl font-bold text-primary-dark">{format(eventDate, 'dd')}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text-main truncate">{event.title}</h3>
        <p className="text-sm text-muted mt-1 line-clamp-2">{event.description}</p>
        
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-muted">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(eventDate, 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <Users className="w-3.5 h-3.5" />
            <span>{rsvps} attending</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col justify-center shrink-0">
        <button 
          onClick={handleRSVP}
          disabled={loading || isProspective}
          title={isProspective ? 'RSVP unlocks after enrolling as a current student' : undefined}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 ${isRSVPed ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-primary text-white hover:bg-primary-dark'}`}
        >
          {isProspective && <Lock className="w-3.5 h-3.5" />}
          {isRSVPed ? 'Going' : isProspective ? 'Locked' : 'RSVP'}
        </button>
      </div>
    </div>
  );
}
