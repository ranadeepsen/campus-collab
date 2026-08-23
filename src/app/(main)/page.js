"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TweetCard from '@/components/ui/tweet-card';
import PostComposer from '@/components/feed/PostComposer';
import FeedFilters from '@/components/feed/FeedFilters';
import MobileFeedWidgets from '@/components/feed/MobileFeedWidgets';
import { Loader2, Lock } from 'lucide-react';

function FeedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(null);
  const [profile, setProfile] = useState(null);

  const [filters, setFilters] = useState({
    tab: 'All',
    collegeId: 'All',
    type: 'All',
    sortBy: 'recent',
    timeRange: 'all'
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (q) queryParams.append('q', q);
        if (filters.tab !== 'All') queryParams.append('tab', filters.tab);
        if (filters.collegeId !== 'All') queryParams.append('collegeId', filters.collegeId);
        if (filters.type !== 'All') queryParams.append('type', filters.type);
        if (filters.sortBy !== 'recent') queryParams.append('sortBy', filters.sortBy);
        if (filters.timeRange !== 'all') queryParams.append('timeRange', filters.timeRange);

        const [postsRes, profileRes] = await Promise.all([
          fetch('/api/posts?' + queryParams.toString()),
          !profile ? fetch('/api/users/me/profile') : Promise.resolve({ ok: true, json: () => Promise.resolve(profile) })
        ]);
        
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        }
        
        if (!profile && profileRes.ok) {
          const profileData = await profileRes.json();
          if (!profileData.error) {
            setAccess(profileData.access || null);
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, q, router]);

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const formatPost = (post) => {
    const now = new Date();
    const postDate = new Date(post.createdAt);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    let timestamp = "Just now";
    if (diffInSeconds > 86400) timestamp = `${Math.floor(diffInSeconds / 86400)}d ago`;
    else if (diffInSeconds > 3600) timestamp = `${Math.floor(diffInSeconds / 3600)}h ago`;
    else if (diffInSeconds > 60) timestamp = `${Math.floor(diffInSeconds / 60)}m ago`;

    return {
      _id: post._id,
      type: post.type,
      pollData: post.pollData,
      author: {
        name: post.author?.profile?.name || "Student",
        handle: post.author?.profile?.name?.toLowerCase().replace(/\s+/g, '_') || "student",
        collegeInfo: `${post.college?.name || 'Campus Collab'} â€¢ ${post.author?.profile?.department || 'Student'}`,
        avatarSrc: post.author?.profile?.photo || "/default-avatar.png",
        isVerified: true,
      },
      content: post.content,
      timestamp: timestamp,
      stats: { 
        replies: post.comments?.length || 0, 
        shares: 0, 
        likes: post.likes?.length || 0 
      },
      isLiked: profile ? post.likes?.includes(profile._id) : false,
      comments: post.comments || [],
      currentUserProfile: profile,
      mediaUrls: post.imageUrl ? [post.imageUrl.includes('res.cloudinary.com') ? post.imageUrl.replace('/upload/', '/upload/c_limit,w_800,f_auto,q_auto/') : post.imageUrl] : [],
      tags: post.tags || [],
      currentUserAccess: access,
    };
  };

  const canPost = access?.canPost;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 mb-2">
        {canPost ? (
          <div className="hidden lg:block">
          <PostComposer onPostCreated={handlePostCreated} profile={profile} />
        </div>
        ) : (
          <div className="hidden lg:flex bg-white rounded-2xl border border-gray-100 p-4 shadow-sm items-center gap-3 text-gray-500">
            <Lock className="w-5 h-5 shrink-0 text-[#5D22D7]" />
            <p className="text-sm">
              {access?.feedMode === 'read-only'
                ? 'As a prospective student you can browse the feed. Posting unlocks after you enroll as a current student.'
                : 'Complete verification to start posting.'}
            </p>
          </div>
        )}

        <FeedFilters filters={filters} setFilters={setFilters} />
        <MobileFeedWidgets profile={profile} />
      </div>

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

export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-[#5D22D7] animate-spin" /></div>}>
      <FeedContent />
    </Suspense>
  );
}




