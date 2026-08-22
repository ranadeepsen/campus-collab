"use client";

import { useState, useEffect } from 'react';
import PostCard from '@/components/feed/PostCard';
import { Loader2, Bookmark } from 'lucide-react';

export default function SavedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/saved')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div className="bg-[#5D22D7] rounded-3xl p-8 sm:p-10 shadow-sm text-white">
        <div className="flex items-center gap-4 mb-2">
          <Bookmark className="w-10 h-10 text-white/90" />
          <h1 className="text-3xl font-extrabold">Saved Posts</h1>
        </div>
        <p className="text-white/80 max-w-xl">Your personal collection of bookmarked posts, resources, and events.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-purple-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No saved posts</h3>
          <p className="text-gray-500">When you bookmark a post on the feed, it will appear here for easy access.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
