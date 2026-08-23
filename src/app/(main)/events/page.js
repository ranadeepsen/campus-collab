"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import EventCard from '@/components/events/EventCard';
import EventComposer from '@/components/events/EventComposer';
import MobileHubTabs from '@/components/layout/MobileHubTabs';
import { Calendar, Filter, Loader2, MapPin } from 'lucide-react';

export default function EventsPage() {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile data
  const [profile, setProfile] = useState(null);
  const [colleges, setColleges] = useState([]);

  // Filters
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMode, setSelectedMode] = useState('');

  // Composer toggle state
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const categories = ['Tech', 'Cultural', 'Sports', 'Career', 'Workshop', 'Other'];

  // Fetch initial metadata
  useEffect(() => {
    fetch('/api/users/me/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfile(data);
        }
      })
      .catch(console.error);
      
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setColleges(data);
      })
      .catch(console.error);
  }, []);

  // Fetch events based on filters
  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCollege) params.append('college', selectedCollege);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedMode) params.append('mode', selectedMode);
    
    fetch(`/api/events?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Only fetch if profile fetch completed (to use default college) 
    // or if selectedCollege is intentionally empty (e.g. 'All Colleges')
    // A simple hack: just wait a tick so profile loads its college first
    const timer = setTimeout(() => {
      fetchEvents();
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [selectedCollege, selectedCategory, selectedMode]);

  const handleEventCreated = (newEvent) => {
    // Optimistically add to top if it matches current filters
    fetchEvents();
    setIsComposerOpen(false); // Close composer after successful creation
  };

  const handleEventDeleted = (eventId) => {
    setEvents(prev => prev.filter(e => e._id !== eventId));
  };

  const canCreateEvent = profile?.user_type === 'current' && profile?.status === 'verified';

  return (
    <div className="space-y-6 pb-20">
      <MobileHubTabs />
      <div className="bg-gradient-to-br from-[#5D22D7] via-[#6320EE] to-[#7B2CBF] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Campus Events</h1>
            <p className="text-purple-200 text-sm sm:text-base max-w-lg">
              Discover workshops, fests, and meetups happening across colleges. Stay connected and never miss an opportunity.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Create Button Block */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="flex items-center gap-2 text-gray-500 shrink-0">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold">Filter:</span>
        </div>
        
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          <select 
            value={selectedCollege} 
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[#5D22D7] focus:border-[#5D22D7] block w-full p-2.5 outline-none font-medium"
          >
            <option value="">All Colleges</option>
            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="sm:w-40 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[#5D22D7] focus:border-[#5D22D7] block w-full p-2.5 outline-none font-medium"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
          <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200 shrink-0 sm:w-48">
            <button
              onClick={() => setSelectedMode(selectedMode === 'offline' ? '' : 'offline')}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-colors font-semibold ${selectedMode === 'offline' ? 'bg-white shadow-sm text-[#5D22D7]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Offline
            </button>
            <button
              onClick={() => setSelectedMode(selectedMode === 'online' ? '' : 'online')}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-colors font-semibold ${selectedMode === 'online' ? 'bg-white shadow-sm text-[#5D22D7]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Online
            </button>
          </div>
        </div>

        {canCreateEvent && (
          <div className="shrink-0 flex items-center pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-4 mt-2 sm:mt-0">
            <button 
              onClick={() => setIsComposerOpen(!isComposerOpen)}
              className="w-full sm:w-auto bg-[#5D22D7] hover:bg-[#4C1D95] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(93,34,215,0.25)] hover:shadow-[0_6px_20px_rgba(93,34,215,0.35)] flex items-center justify-center gap-2"
            >
              <span className="text-lg leading-none mt-[-2px]">+</span> Event
            </button>
          </div>
        )}
      </div>

      {/* Conditional Composer */}
      {canCreateEvent && isComposerOpen && (
        <EventComposer onEventCreated={handleEventCreated} userProfile={profile} />
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
          <p className="font-medium">Finding events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No upcoming events found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#5D22D7] mx-auto mt-10" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {events.map(event => (
              <EventCard key={event._id} event={event} onEventDeleted={handleEventDeleted} />
            ))}
          </div>
        </Suspense>
      )}
    </div>
  );
}


