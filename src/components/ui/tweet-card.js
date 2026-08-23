"use client";

import * as React from "react";
import Image from "next/image";
import { Heart, MessageSquare, Bookmark, MoreHorizontal, CheckCircle2, Send, Loader2, Flag } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import PollViewer from '@/components/feed/PollViewer';

export default function TweetCard({
  _id,
  type,
  pollData,
  author,
  content,
  timestamp,
  stats,
  mediaUrls,
  embeddedLink,
  tags,
  isLiked: initialIsLiked,
  comments: initialComments,
  currentUserProfile,
  currentUserAccess
}) {
  const [isLiked, setIsLiked] = React.useState(initialIsLiked || false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(stats?.likes || 0);
  const [showMenu, setShowMenu] = React.useState(false);
  
  const [showComments, setShowComments] = React.useState(false);
  const [comments, setComments] = React.useState(initialComments || []);

  const handleReport = async () => {
    const reason = window.prompt("Why are you reporting this post?");
    if (!reason) return;
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: 'post', content_id: _id, reason })
      });
      if (res.ok) {
        alert("Post reported successfully. Our team will review it.");
      } else {
        alert("Failed to report post.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while reporting.");
    }
    setShowMenu(false);
  };
  const [newComment, setNewComment] = React.useState("");
  const [isCommenting, setIsCommenting] = React.useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    
    try {
      const res = await fetch(`/api/posts/${_id}/like`, { method: 'POST' });
      if (!res.ok) {
        // Revert on failure
        setIsLiked(isLiked);
        setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      } else {
        const data = await res.json();
        setIsLiked(data.hasLiked);
        setLikeCount(data.likesCount);
      }
    } catch (err) {
      console.error(err);
      setIsLiked(isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      const res = await fetch(`/api/posts/${_id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      });
      
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
        setNewComment("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post comment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <article className="w-full bg-white rounded-2xl px-0 py-4 sm:p-4 border border-gray-100 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
            <Image
              src={author.avatarSrc}
              alt={author.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-gray-900 leading-none hover:text-[#5D22D7] cursor-pointer transition-colors">
                {author.name}
              </h4>
              {author.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-[#5D22D7] fill-[#F0EBFD]" />
              )}
            </div>
            <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 mt-1 text-[11px] text-gray-500 font-medium">
              <span>{author.collegeInfo}</span>
              <span className="text-gray-300">â€¢</span>
              <span>{timestamp}</span>
              {type === 'poll' && (
                <span className="ml-1 bg-purple-50 text-[#5D22D7] px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                  ðŸ“Š Poll
                </span>
              )}
              {type === 'event' && (
                <span className="ml-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                  ðŸŽ« Event
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors cursor-pointer -mr-2 -mt-2"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              ></div>
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReport();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  Report Post
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="space-y-2.5">
        {type === 'poll' ? (
          <PollViewer postId={_id} pollData={pollData} currentUserAccess={currentUserAccess} />
        ) : (
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
            {content}
          </p>
        )}

        {/* Media Images Grid */}
        {mediaUrls && mediaUrls.length > 0 && (
          <div className={`rounded-xl overflow-hidden grid gap-2 ${mediaUrls.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {mediaUrls.map((url, i) => (
              <div key={i} className={`overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center ${mediaUrls.length === 1 ? 'max-h-[350px] w-full' : 'h-40 sm:h-48'}`}>
                <img 
                  src={url} 
                  className={`w-full ${mediaUrls.length === 1 ? 'h-auto max-h-[350px] object-contain' : 'h-full object-cover'} hover:scale-103 transition-transform duration-300 cursor-pointer`} 
                  alt="Post media" 
                />
              </div>
            ))}
          </div>
        )}

        {/* Embedded Link Card */}
        {embeddedLink && (
          <div className="border border-gray-200/80 rounded-xl overflow-hidden bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50 border-b border-gray-200/80 flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-white rounded-lg p-3 shadow-xs border border-gray-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Discover</span>
                  <div className="w-12 h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-[#5D22D7]/10 rounded-md"></div>
                  <div className="h-16 bg-purple-50 rounded-md"></div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{embeddedLink.domain}</p>
              <h5 className="text-sm font-bold text-gray-900 truncate">{embeddedLink.title}</h5>
            </div>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-block px-3 py-1 bg-[#F0EBFD] text-[#5D22D7] text-xs font-semibold rounded-full cursor-pointer hover:bg-purple-100 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement Row */}
        <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-gray-500">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-semibold hover:text-red-500 transition-colors cursor-pointer ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-[#5D22D7] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length}</span>
            </button>

            </div>
            
            <button 
              type="button" 
            onClick={handleSave}
            className={`p-1.5 hover:text-[#5D22D7] transition-colors cursor-pointer ${isSaved ? 'text-[#5D22D7]' : ''}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#5D22D7]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {/* Existing Comments */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {comments.map((comment, idx) => (
              <div key={comment._id || idx} className="flex gap-2.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <Image 
                    src={comment.author?.profile?.photo || "/default-avatar.png"} 
                    alt={comment.author?.profile?.name || "User"}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-xs text-gray-900">{comment.author?.profile?.name || "Student"}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt)) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-center text-gray-500 py-2">No comments yet. Be the first to start the conversation!</p>
            )}
          </div>

          <form onSubmit={submitComment} className="flex gap-2 items-center relative">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100">
              <Image 
                src={currentUserProfile?.profile?.photo || "/default-avatar.png"} 
                alt="You"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <input 
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-xs focus:outline-none focus:border-[#5D22D7] focus:ring-1 focus:ring-[#5D22D7] transition-all"
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || isCommenting}
              className="absolute right-1.5 p-1.5 rounded-full bg-[#5D22D7] text-white disabled:opacity-50 disabled:bg-gray-300 transition-colors"
            >
              {isCommenting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

