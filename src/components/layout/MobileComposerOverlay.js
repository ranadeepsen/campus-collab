"use client";

import { useMobileComposer } from './MobileComposerContext';
import PostComposer from '@/components/feed/PostComposer';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MobileComposerOverlay() {
  const { isOpen, closeComposer } = useMobileComposer();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isOpen && !profile) {
      fetch('/api/users/me/profile')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setProfile(data);
        })
        .catch(console.error);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col lg:hidden animate-in slide-in-from-bottom-full duration-200">
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        <button onClick={closeComposer} className="p-2 rounded-full hover:bg-accent-soft transition-colors text-muted">
          <X className="w-6 h-6" />
        </button>
        <span className="font-bold text-text-main text-lg">Create Post</span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* We reuse the desktop composer, but pass a flag or just let it render full width. 
            Since PostComposer has its own padding/borders, we might need a wrapper or CSS. 
            For now, just rendering it directly. */}
        <PostComposer profile={profile} onPostCreated={() => closeComposer()} mobileMode={true} />
      </div>
    </div>
  );
}
