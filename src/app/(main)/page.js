"use client";

import { useState, useEffect } from 'react';
import TweetCard from '@/components/ui/tweet-card';
import PostComposer from '@/components/feed/PostComposer';
import FeedFilters from '@/components/feed/FeedFilters';
import { Loader2, Lock } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetch('/api/users/me/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setAccess(data.access || null);
      })
      .catch(console.error);
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const formatPost = (post) => {
    const now = new Date();
    const postDate = new Date(post.createdAt || Date.now());
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    let timestamp = "Just now";
    if (diffInSeconds > 86400) timestamp = `${Math.floor(diffInSeconds / 86400)}d ago`;
    else if (diffInSeconds > 3600) timestamp = `${Math.floor(diffInSeconds / 3600)}h ago`;
    else if (diffInSeconds > 60) timestamp = `${Math.floor(diffInSeconds / 60)}m ago`;

    return {
      _id: post._id,
      author: {
        name: post.author?.profile?.name || "Student",
        handle: post.author?.profile?.name?.toLowerCase().replace(/\s+/g, '_') || "student",
        collegeInfo: `${post.college?.name || 'Campus Collab'} • ${post.author?.profile?.department || 'Student'}`,
        avatarSrc: post.author?.profile?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        isVerified: true,
      },
      content: post.content,
      timestamp: timestamp,
      stats: { 
        replies: post.comments?.length || 0, 
        shares: 0, 
        likes: post.likes?.length || 0 
      },
      mediaUrls: post.imageUrl ? [post.imageUrl] : [],
      tags: post.tags || [],
    };
  };

  const canPost = access?.canPost;

  return (
    <div className="flex flex-col gap-5">
      {canPost ? (
        <PostComposer onPostCreated={handlePostCreated} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 text-gray-500">
          <Lock className="w-5 h-5 shrink-0 text-[#5D22D7]" />
          <p className="text-sm">
            {access?.feedMode === 'read-only'
              ? 'As a prospective student you can browse the feed. Posting unlocks after you enroll as a current student.'
              : 'Complete verification to start posting.'}
          </p>
        </div>
      )}

      <FeedFilters />

      <div className="space-y-5">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-[#5D22D7] animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <TweetCard key={post._id} {...formatPost(post)} />
          ))
        ) : (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-medium">No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
