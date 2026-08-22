"use client";

import { useState, useEffect } from 'react';
import { Search, Loader2, Award, Building2, MapPin, MessageSquare, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function MentorsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [ambassadors, setAmbassadors] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const TOPICS = ["All", "Academics", "Hostel & Campus Life", "Placements", "Clubs & Societies", "Admissions Process", "Other"];
  const [activeTopic, setActiveTopic] = useState('All');
  const [activeCollege, setActiveCollege] = useState('All');

  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setColleges(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchAmbassadors();
  }, [activeTopic, activeCollege]);

  const fetchAmbassadors = async () => {
    setLoading(true);
    try {
      const topicQuery = activeTopic === 'All' ? '' : activeTopic;
      const collegeQuery = activeCollege === 'All' ? '' : activeCollege;
      const res = await fetch(`/api/ambassadors?topic=${topicQuery}&collegeId=${collegeQuery}`);
      if (res.ok) {
        const data = await res.json();
        setAmbassadors(data.ambassadors);
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (ambassadorId) => {
    try {
      const res = await fetch('/api/ambassador-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambassadorId })
      });
      if (res.ok) {
        alert('Connection request sent! Once the ambassador accepts, you can start chatting.');
      } else {
        const data = await res.json();
        alert(data.error || 'Could not start conversation');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAmbassadors = ambassadors.filter(a => 
    a.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.profile?.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex gap-6 relative">
      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-full lg:max-w-[calc(100%-340px)] min-w-0">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Mentorship & Ambassadors</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Connect with current students to learn about campus life, courses, and more.</p>
            </div>
            
            <Link 
              href="/ambassador/apply" 
              className="bg-[#5D22D7] hover:bg-[#4C1D95] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_14px_rgba(93,34,215,0.25)] hover:shadow-[0_6px_20px_rgba(93,34,215,0.35)] shrink-0 flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5" />
              Become an Ambassador
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or department..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] shadow-sm transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative shrink-0 w-full sm:w-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center pr-3">
              <div className="pl-4 py-3 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-gray-400" />
              </div>
              <select 
                className="w-full sm:w-48 pl-2 pr-4 py-3 bg-transparent font-medium text-gray-700 focus:outline-none cursor-pointer appearance-none"
                value={activeCollege}
                onChange={e => setActiveCollege(e.target.value)}
              >
                <option value="All">All Colleges</option>
                {colleges.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="relative shrink-0 w-full sm:w-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center pr-3">
              <div className="pl-4 py-3 flex items-center justify-center">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select 
                className="w-full sm:w-48 pl-2 pr-4 py-3 bg-transparent font-medium text-gray-700 focus:outline-none cursor-pointer appearance-none"
                value={activeTopic}
                onChange={e => setActiveTopic(e.target.value)}
              >
                {TOPICS.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-[#5D22D7] mb-4" />
            <p className="font-medium">Loading ambassadors...</p>
          </div>
        ) : filteredAmbassadors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No ambassadors found</h3>
            <p className="text-gray-500">We couldn't find any ambassadors matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-10">
            {filteredAmbassadors.map(amb => (
              <div 
                key={amb._id} 
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group flex flex-col h-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-50">
                    {amb.profile?.photo ? (
                      <img src={amb.profile.photo} alt={amb.profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400 bg-gray-100">
                        {amb.profile?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#5D22D7] transition-colors line-clamp-1">{amb.profile?.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{amb.profile?.college?.name}</p>
                    <p className="text-[10px] font-bold text-[#5D22D7] bg-[#5D22D7]/10 px-2 py-0.5 rounded inline-block mt-1 uppercase tracking-wider">{amb.profile?.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-xl justify-center font-medium">
                  <span className="text-amber-500 text-sm">★</span>
                  <span>{amb.rating ? amb.rating.toFixed(1) : 'New'}</span>
                  {amb.ratingCount > 0 && <span className="ml-1">({amb.ratingCount} reviews)</span>}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  <button 
                    onClick={() => startChat(amb._id)}
                    className="w-full py-2 bg-[#5D22D7] text-white hover:bg-[#4C1D95] rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Request Connection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar - Leaderboard */}
      <div className="hidden lg:block w-[320px] shrink-0">
        <div className="sticky top-[88px]">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-gray-900">Top Ambassadors</h3>
              </div>
              <p className="text-xs text-amber-700 font-medium">Ranked by points</p>
            </div>
            
            <div className="divide-y divide-gray-50">
              {leaderboard.length === 0 && !loading ? (
                <div className="p-8 text-center text-sm text-gray-500">No ranked ambassadors yet</div>
              ) : leaderboard.map((amb, index) => (
                <div key={amb._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${index === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' : index === 1 ? 'bg-gray-200 text-gray-600 border border-gray-300' : index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                    #{index + 1}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                    {amb.profile?.photo ? (
                      <img src={amb.profile.photo} alt={amb.profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                        {amb.profile?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 truncate text-sm">{amb.profile?.name}</h3>
                    <p className="text-[11px] text-gray-500 font-medium">{amb.ambassadorPoints} points • {amb.rating ? `★ ${amb.rating.toFixed(1)}` : 'New'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
