"use client";

import { useState, useEffect } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState({ mentors: [], colleges: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mentors'); // mentors or colleges

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-text-main">Campus Leaderboard</h1>
        </div>
        <p className="text-muted max-w-2xl">
          See who is making the biggest impact. Top ambassadors earn exclusive rewards and recognition for their college.
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-surface rounded-xl border border-border-light w-fit">
        <button 
          onClick={() => setActiveTab('mentors')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'mentors' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-text-main'}`}
        >
          Top Ambassadors
        </button>
        <button 
          onClick={() => setActiveTab('colleges')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'colleges' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-text-main'}`}
        >
          Top Colleges
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border-light overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-muted">Loading leaderboard...</div>
        ) : (
          <div className="divide-y divide-border-light">
            {activeTab === 'mentors' && data.mentors.map((mentor, index) => (
              <div key={mentor._id} className="flex items-center gap-4 p-4 hover:bg-accent-soft/50 transition-colors">
                <div className="w-8 font-bold text-center text-muted text-lg">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-full bg-accent-soft shrink-0">
                  {mentor.user?.profile?.photo && (
                    <img src={mentor.user.profile.photo} alt={mentor.user.profile.name} className="w-full h-full rounded-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-main truncate">{mentor.user?.profile?.name}</h3>
                  <p className="text-sm text-muted truncate">{mentor.college?.name}</p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-xl font-bold border border-yellow-200">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{mentor.totalPoints} pts</span>
                </div>
              </div>
            ))}
            
            {activeTab === 'colleges' && data.colleges.map((collegeEntry, index) => (
              <div key={collegeEntry.college._id} className="flex items-center gap-4 p-4 hover:bg-accent-soft/50 transition-colors">
                <div className="w-8 font-bold text-center text-muted text-lg">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 shrink-0 flex items-center justify-center">
                  <Medal className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-main truncate">{collegeEntry.college.name}</h3>
                </div>
                <div className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-xl font-bold shadow-sm">
                  <span>{collegeEntry.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
