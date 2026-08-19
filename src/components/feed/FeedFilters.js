"use client";

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function FeedFilters() {
  const [activeTab, setActiveTab] = useState('All');
  
  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Following', label: 'Following' },
    { id: 'Universities', label: 'Universities', hasDropdown: true },
  ];

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-1 bg-white/70 backdrop-blur-xs p-1 rounded-full border border-gray-100 shadow-2xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#F0EBFD] text-[#5D22D7] shadow-2xs' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.hasDropdown && (
                  <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-[#5D22D7]' : 'text-gray-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Settings / Filter Icon */}
      <button 
        type="button"
        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#5D22D7] bg-white rounded-xl border border-gray-200/80 hover:border-[#5D22D7]/30 shadow-2xs transition-colors shrink-0 cursor-pointer"
        aria-label="Feed Settings"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
