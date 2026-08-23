"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileHubTabs from '@/components/layout/MobileHubTabs';
import { useUser } from '@clerk/nextjs';
import { Plus } from 'lucide-react';
import ClubCard from '@/components/shared/ClubCard';

const CATEGORIES = ["All", "Tech", "Cultural", "Sports", "Arts", "Career", "Other"];

export default function ClubsPage() {
  const { user } = useUser();
  const [clubs, setClubs] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [selectedCollege, setSelectedCollege] = useState("");
  
  const canCreate = user?.publicMetadata?.user_type === 'current' && user?.publicMetadata?.status === 'verified';

  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setColleges(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `/api/clubs?category=${category}`;
    if (selectedCollege) {
      url += `&collegeId=${selectedCollege}`;
    }
    
    fetch(url, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClubs(data);
        } else {
          setClubs([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [category, selectedCollege]);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-sm border border-border-light relative overflow-hidden bg-gradient-to-br from-[#5D22D7] via-[#6320EE] to-[#7B2CBF] text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Campus Clubs</h1>
            <p className="text-purple-200 text-sm sm:text-base max-w-lg">Discover and join the most active communities on campus.</p>
          </div>
          {canCreate && (
            <Link 
              href="/clubs/create"
              className="inline-flex items-center gap-2 bg-white text-[#5D22D7] px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Create Club
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                category === c 
                  ? 'bg-[#5D22D7] text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        
        <select 
          value={selectedCollege} 
          onChange={(e) => setSelectedCollege(e.target.value)}
          className="sm:w-64 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[#5D22D7] focus:border-[#5D22D7] p-2 outline-none font-medium shadow-sm shrink-0"
        >
          <option value="">All Colleges</option>
          {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">Loading clubs...</div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-10 text-muted bg-surface rounded-2xl border border-border-light shadow-sm">
          No clubs found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map(club => <ClubCard key={club._id} club={club} />)}
        </div>
      )}
    </div>
  );
}


