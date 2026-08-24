"use client";

import { useState } from 'react';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [isSaved, setIsSaved] = useState(post.hasSaved || false);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likesCount);
        setIsLiked(data.hasLiked);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}/save`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[20px] p-4 sm:p-6 shadow-[var(--shadow-soft)] border border-white/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-accent-soft shrink-0">
          {post.author?.profile?.photo && (
            <img src={post.author.profile.photo} alt={post.author.profile.name} className="w-full h-full rounded-full object-cover" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-text-main text-[15px]">{post.author?.profile?.name || 'Anonymous'}</span>
            {post.author?.isAmbassador && (
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </div>
          <div className="text-xs text-muted flex items-center gap-1.5 flex-wrap mt-0.5">
            {post.college?.name && (
              <>
                <span>{post.college.name}</span>
                <span>•</span>
              </>
            )}
            {post.author?.profile?.department && (
              <>
                <span>{post.author.profile.department}</span>
                <span>•</span>
              </>
            )}
            <span>{formatDistanceToNow(new Date(post.createdAt)).replace('about ', '')} ago</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-text-main whitespace-pre-wrap text-[15px]">{post.content}</p>
        {post.type === 'photo' && post.imageUrl && (
          <img src={post.imageUrl} alt="Post content" className="w-full rounded-xl mt-2.5 object-cover max-h-96" />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border-light">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-sm font-medium ${
              isLiked ? 'text-red-500 hover:bg-red-50' : 'text-muted hover:bg-accent-soft hover:text-primary'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>
          
          <button className="flex items-center gap-2 p-2 text-muted hover:bg-accent-soft hover:text-primary rounded-lg transition-colors text-sm font-medium">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
        
        <button 
          onClick={handleSave}
          className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-gold bg-yellow-50' : 'text-muted hover:bg-accent-soft hover:text-primary'}`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}
