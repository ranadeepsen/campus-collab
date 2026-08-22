"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Lock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function ClubCard({ club, index, isSidebar }) {
  const router = useRouter();
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

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return; // Don't navigate if clicking the join button
    router.push(`/clubs/${club._id}`);
  };

  if (isSidebar) {
    return (
      <div onClick={handleCardClick} className="p-4 hover:bg-gray-50 transition-colors flex flex-col gap-3 relative cursor-pointer">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
            #{index + 1}
          </div>
          {club.logoUrl && (
            <img src={club.logoUrl} alt="Logo" className="w-8 h-8 shrink-0 rounded-full object-cover border border-gray-100" />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 truncate text-sm leading-tight">{club.name}</h3>
            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{club.college?.name || club.university}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
            <Users className="w-3 h-3" />
            <span>{members}</span>
          </div>
          
          <button 
            onClick={handleJoin}
            disabled={loading || isProspective}
            title={isProspective ? 'Join clubs after enrolling as a current student' : undefined}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50 flex items-center gap-1 ${isMember ? 'bg-purple-100 text-[#5D22D7]' : 'bg-[#5D22D7] text-white hover:bg-[#4C1D95]'}`}
          >
            {isProspective && <Lock className="w-2.5 h-2.5" />}
            {isMember ? 'Joined' : isProspective ? 'Locked' : 'Join'}
          </button>
        </div>
        {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div onClick={handleCardClick} className="bg-surface rounded-2xl shadow-sm border border-border-light flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden">
      
      {club.coverImageUrl && (
        <div className="absolute top-0 left-0 right-0 h-16 bg-gray-100 opacity-40">
          <img src={club.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-3 pt-2">
          <div className="flex items-center gap-3">
            {club.logoUrl ? (
              <img src={club.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5D22D7] to-[#7B2CBF] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                {club.name.charAt(0)}
              </div>
            )}
            <h3 className="font-bold text-lg text-text-main group-hover:text-[#5D22D7] transition-colors line-clamp-2">{club.name}</h3>
          </div>
          {club.trending && (
            <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full font-bold shrink-0 mt-1">Trending</span>
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
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
