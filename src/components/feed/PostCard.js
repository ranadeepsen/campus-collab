"use client";

import { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false); // To sync with actual user state later
  const [isSaved, setIsSaved] = useState(false);

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
    <div className="bg-surface rounded-2xl p-4 sm:p-5 shadow-sm border border-border-light">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent-soft shrink-0">
          {post.author?.profile?.photo && (
            <img src={post.author.profile.photo} alt={post.author.profile.name} className="w-full h-full rounded-full object-cover" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-main">{post.author?.profile?.name || 'Anonymous'}</span>
            <span className="text-xs text-primary bg-accent-soft px-2 py-0.5 rounded-full font-medium">
              {post.author?.profile?.department || 'Student'}
            </span>
          </div>
          <div className="text-xs text-muted flex items-center gap-1">
            <span>{post.college?.name}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-text-main whitespace-pre-wrap">{post.content}</p>
        {post.type === 'photo' && post.imageUrl && (
          <img src={post.imageUrl} alt="Post content" className="w-full rounded-xl mt-3 object-cover max-h-96" />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border-light">
        <div className="flex gap-1 sm:gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-sm font-medium ${isLiked ? 'text-red-500 bg-red-50' : 'text-muted hover:bg-accent-soft hover:text-primary'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>
          
          <button className="flex items-center gap-2 p-2 text-muted hover:bg-accent-soft hover:text-primary rounded-lg transition-colors text-sm font-medium">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments?.length || 0}</span>
          </button>
          
          <button className="flex items-center gap-2 p-2 text-muted hover:bg-accent-soft hover:text-primary rounded-lg transition-colors text-sm font-medium">
            <Share className="w-5 h-5" />
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
