"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Users, ShieldCheck, MapPin, Loader2, Edit, AlertCircle } from 'lucide-react';
import ClubFeed from '@/components/clubs/ClubFeed';
import ClubMembers from '@/components/clubs/ClubMembers';
import ClubAdminPanel from '@/components/clubs/ClubAdminPanel';

export default function ClubDetailPage({ params }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const isProspective = user?.publicMetadata?.user_type === 'prospective';
  const resolvedParams = use(params);
  const clubId = resolvedParams.id;
  
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'members', 'admin'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClub = async () => {
    try {
      const res = await fetch(`/api/clubs/${clubId}`);
      if (!res.ok) throw new Error('Club not found or not approved');
      const data = await res.json();
      setClub(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [clubId]);

  if (!isLoaded || loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (error || !club) return (
    <div className="p-10 text-center bg-white rounded-2xl border border-gray-100">
      <p className="text-gray-500 mb-4">{error || 'Club not found'}</p>
      <Link href="/clubs" className="text-[#5D22D7] font-semibold hover:underline">Back to Clubs</Link>
    </div>
  );

  const handleJoinAction = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/clubs/${clubId}/join`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setClub(prev => ({
        ...prev,
        membersCount: data.membersCount,
        myRole: data.myRole
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getJoinButton = () => {
    if (club.myRole === 'admin') return null; // Admins don't have a join button, they are already in
    if (club.myRole === 'member') {
      return (
        <button onClick={handleJoinAction} disabled={actionLoading} className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          Leave Club
        </button>
      );
    }
    if (club.myRole === 'pending') {
      return (
        <button disabled className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Request Pending
        </button>
      );
    }
    
    // Not a member
    return (
      <button 
        onClick={handleJoinAction} 
        disabled={actionLoading || isProspective}
        title={isProspective ? "Join clubs after enrolling as a current student" : undefined}
        className="px-6 py-2 rounded-xl text-sm font-bold bg-[#5D22D7] text-white hover:bg-[#4C1D95] transition-colors disabled:opacity-50"
      >
        {club.joinMode === 'open' ? 'Join Club' : 'Request to Join'}
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-semibold">Back</span>
      </button>

      {club.status === 'pending_review' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Under Review</h4>
            <p className="text-sm mt-1">This club is currently pending approval by a platform administrator. It is not visible to the public yet.</p>
          </div>
        </div>
      )}

      {/* Header Profile */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="h-32 sm:h-48 bg-gradient-to-r from-purple-100 to-indigo-100 relative">
          {club.coverImageUrl && (
            <img src={club.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>
        
        <div className="px-6 sm:px-8 pb-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-sm border-4 border-white flex items-center justify-center text-3xl sm:text-5xl bg-gradient-to-br from-[#5D22D7] to-[#7B2CBF] text-white font-bold relative z-10 overflow-hidden shrink-0">
              {club.logoUrl ? (
                <img src={club.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                club.name.charAt(0)
              )}
            </div>
            
            <div className="flex gap-2">
              {getJoinButton()}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{club.name}</h1>
                {club.status === 'approved' && (
                  <ShieldCheck className="w-6 h-6 text-green-500" title="Verified Club" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {club.college?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {club.membersCount} members
                </span>
                <span className="px-2.5 py-0.5 bg-gray-100 rounded-full font-medium text-gray-700 text-xs">
                  {club.category}
                </span>
              </div>
            </div>

            <p className="text-gray-700 whitespace-pre-wrap">{club.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'feed' ? 'border-[#5D22D7] text-[#5D22D7]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Feed
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'members' ? 'border-[#5D22D7] text-[#5D22D7]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Members
          </button>
          {club.myRole === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'admin' ? 'border-[#5D22D7] text-[#5D22D7]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'feed' && <ClubFeed clubId={clubId} myRole={club.myRole} clubName={club.name} />}
        {activeTab === 'members' && <ClubMembers clubId={clubId} />}
        {activeTab === 'admin' && club.myRole === 'admin' && <ClubAdminPanel club={club} onUpdate={fetchClub} />}
      </div>
    </div>
  );
}
