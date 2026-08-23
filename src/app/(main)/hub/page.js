"use client";

import { useState, useEffect } from 'react';
import { Users, Search, MessageSquare, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileHubTabs from '@/components/layout/MobileHubTabs';

export default function HubPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [colleges, setColleges] = useState([]);
  const [clubs, setClubs] = useState([]);
  
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  
  const router = useRouter();

  // Fetch base metadata
  useEffect(() => {
    fetch('/api/colleges').then(r => r.json()).then(data => {
      if(Array.isArray(data)) setColleges(data);
    });
  }, []);

  // Fetch clubs when college changes
  useEffect(() => {
    const clubUrl = selectedCollege ? `/api/clubs?collegeId=${selectedCollege}` : '/api/clubs?collegeId=all';
    fetch(clubUrl).then(r => r.json()).then(data => {
      if(Array.isArray(data)) setClubs(data);
      setSelectedClub(''); // Reset club when college changes
    });
  }, [selectedCollege]);

  // Fetch students based on filters
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCollege) params.append('collegeId', selectedCollege);
    if (selectedDepartment) params.append('department', selectedDepartment);
    if (selectedClub) params.append('clubId', selectedClub);

    // Debounce or directly fetch
    const timeout = setTimeout(() => {
      fetch(`/api/students?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setStudents(data);
          } else {
            console.error("API Error:", data.error);
            setStudents([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, selectedCollege, selectedDepartment, selectedClub]);

  const startDirectChat = async (studentUserId) => {
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: studentUserId, type: 'direct' })
      });
      if (res.ok) {
        const thread = await res.json();
        router.push(`/messages/${thread._id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendConnectionRequest = async (studentUserId) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: studentUserId })
      });
      if (res.ok) {
        // Optimistically update the UI
        setStudents(prev => prev.map(s => 
          s._id === studentUserId ? { ...s, connectionStatus: 'pending_sent' } : s
        ));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compute available departments based on selected college
  const availableDepartments = selectedCollege 
    ? (colleges.find(c => c._id === selectedCollege)?.departments || [])
    : Array.from(new Set(colleges.flatMap(c => c.departments || []))).sort();

  return (
    <div className="space-y-5">
      <MobileHubTabs />
      {/* Hero Header Div */}
      <div className="bg-gradient-to-r from-[#5D22D7] to-[#8B4CFF] rounded-2xl px-6 py-5 sm:px-8 sm:py-6 shadow-md text-white relative overflow-hidden flex flex-col justify-center">
        {/* Background graphic elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-white opacity-10 rounded-full blur-xl translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">Campus Hub</h1>
            <p className="text-purple-100 text-sm sm:text-base font-medium">
              Discover and connect with other students.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Div */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-2 mb-3.5">
          <Search className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Find Students</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search by Name */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border-light rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* College Filter */}
          <select 
            value={selectedCollege} 
            onChange={(e) => {
              setSelectedCollege(e.target.value);
              setSelectedDepartment(''); // reset department if it doesn't exist in new college
            }}
            className="w-full bg-background border border-border-light rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700"
          >
            <option value="">All Colleges</option>
            {colleges.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-background border border-border-light rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700"
          >
            <option value="">All Departments</option>
            {availableDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Club Filter */}
          <select 
            value={selectedClub} 
            onChange={(e) => setSelectedClub(e.target.value)}
            className="w-full bg-background border border-border-light rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700"
          >
            <option value="">All Clubs</option>
            {clubs.map(club => (
              <option key={club._id} value={club._id}>{club.name}</option>
            ))}
          </select>

        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted text-sm font-medium">Finding students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 text-muted bg-surface rounded-2xl border border-border-light shadow-sm">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No students found.</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map(student => (
            <div key={student._id} className="bg-surface rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border-light flex flex-col gap-3 group hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-soft shrink-0 border border-gray-100 overflow-hidden">
                  <img src={student.profile?.photo || "/default-avatar.png"} alt={student.profile?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-bold text-gray-900 truncate text-sm group-hover:text-primary transition-colors">{student.profile?.name}</h3>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5" title={student.profile?.college?.name}>{student.profile?.college?.name || 'Student'}</p>
                </div>
              </div>
              
              {student.profile?.department && (
                <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 mt-1 border border-gray-100">
                  <p className="text-xs text-gray-600 truncate">{student.profile.department}</p>
                </div>
              )}
              
              <div className="mt-auto pt-2">
                {student.connectionStatus === 'connected' ? (
                  <button 
                    onClick={() => startDirectChat(student._id)}
                    className="w-full bg-[#F0EBFD] hover:bg-[#5D22D7] text-[#5D22D7] hover:text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                ) : student.connectionStatus === 'pending_sent' ? (
                  <button 
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Clock className="w-3.5 h-3.5" /> Requested
                  </button>
                ) : student.connectionStatus === 'pending_received' ? (
                  <button 
                    onClick={() => router.push('/connections')}
                    className="w-full bg-emerald-100 hover:bg-emerald-500 text-emerald-700 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Accept
                  </button>
                ) : (
                  <button 
                    onClick={() => sendConnectionRequest(student._id)}
                    className="w-full bg-[#F0EBFD] hover:bg-[#5D22D7] text-[#5D22D7] hover:text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

