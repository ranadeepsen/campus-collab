"use client";

import { useState } from 'react';
import { Users, Lock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function ClubCard({ club }) {
  const { user } = useUser();
  const isProspective = user?.publicMetadata?.user_type === 'prospective';
  const [members, setMembers] = useState(club.memberIds?.length || 0);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (isProspective) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/clubs/${club._id}/join`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMembers(data.membersCount);
        setIsMember(data.isMember);
      } else {
        setError(data.error || 'Could not join club');
      }
    } catch (e) {
      console.error(e);
      setError('Could not join club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-text-main">{club.name}</h3>
        {club.trending && (
          <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full font-bold">Trending</span>
        )}
      </div>
      
      <p className="text-sm text-muted mb-4 flex-grow line-clamp-3">
        {club.description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-border-light mt-auto">
        <div className="flex items-center gap-1.5 text-sm text-muted font-medium">
          <Users className="w-4 h-4" />
          <span>{members} members</span>
        </div>
        
        <button 
          onClick={handleJoin}
          disabled={loading || isProspective}
          title={isProspective ? 'Join clubs after enrolling as a current student' : undefined}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 ${isMember ? 'bg-accent-soft text-primary' : 'bg-primary text-white hover:bg-primary-dark'}`}
        >
          {isProspective && <Lock className="w-3.5 h-3.5" />}
          {isMember ? 'Joined' : isProspective ? 'Locked' : 'Join'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
