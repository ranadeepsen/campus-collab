"use client";

import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';

export default function FeedFilters({ filters, setFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [colleges, setColleges] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setColleges(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters = 
    filters.collegeId !== 'All' || 
    filters.type !== 'All' || 
    filters.sortBy !== 'recent' || 
    filters.timeRange !== 'all';

  const handleClearAll = () => {
    setFilters(prev => ({
      ...prev,
      collegeId: 'All',
      type: 'All',
      sortBy: 'recent',
      timeRange: 'all'
    }));
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      {/* 2-Way Compact Toggle */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center bg-white/70 backdrop-blur-xs p-1 rounded-full border border-gray-100 shadow-2xs">
          {['All', 'Following'].map((tabId) => {
            const isActive = filters.tab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => updateFilter('tab', tabId)}
                className={`px-4 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#F0EBFD] text-[#5D22D7] shadow-2xs' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tabId}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Settings / Filter Icon */}
      <div className="relative" ref={panelRef}>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border shadow-2xs transition-colors shrink-0 cursor-pointer relative ${
            isOpen ? 'bg-[#F0EBFD] text-[#5D22D7] border-[#5D22D7]/30' : 'bg-white text-gray-500 hover:text-[#5D22D7] border-gray-200/80 hover:border-[#5D22D7]/30'
          }`}
          aria-label="Feed Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#5D22D7] rounded-full ring-2 ring-white"></span>
          )}
        </button>

        {/* Filter Popup Panel */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button 
                  onClick={handleClearAll}
                  className="text-[11px] font-semibold text-[#5D22D7] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* University */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">University</label>
                <div className="relative">
                  <select 
                    value={filters.collegeId}
                    onChange={(e) => updateFilter('collegeId', e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#5D22D7] focus:ring-1 focus:ring-[#5D22D7] cursor-pointer"
                  >
                    <option value="All">All Universities</option>
                    {colleges.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Post Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Post Type</label>
                <div className="relative">
                  <select 
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#5D22D7] focus:ring-1 focus:ring-[#5D22D7] cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Text">Text</option>
                    <option value="Photo/Video">Photo/Video</option>
                    <option value="Event">Event</option>
                    <option value="Poll">Poll</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort By & Time Range */}
              <div className="space-y-1.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">Sorting</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select 
                      value={filters.sortBy}
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[11px] font-medium text-gray-900 focus:outline-none focus:border-[#5D22D7] focus:ring-1 focus:ring-[#5D22D7] cursor-pointer"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="active">Most Active</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative flex-1">
                    <select 
                      value={filters.timeRange}
                      onChange={(e) => updateFilter('timeRange', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[11px] font-medium text-gray-900 focus:outline-none focus:border-[#5D22D7] focus:ring-1 focus:ring-[#5D22D7] cursor-pointer"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
