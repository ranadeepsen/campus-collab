"use client";

import * as React from "react";
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, CheckCircle2 } from "lucide-react";

export default function TweetCard({
  author,
  content,
  timestamp,
  stats,
  mediaUrls,
  embeddedLink,
  tags,
}) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(stats?.likes || 0);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <article className="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 shrink-0">
            <img
              src={author.avatarSrc}
              alt={author.name}
              className="w-full h-full object-cover"
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
            <p className="text-xs text-gray-500 font-medium mt-1">
              {author.collegeInfo}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{timestamp}</p>
          </div>
        </div>

        <button 
          type="button" 
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content Body */}
      <div className="space-y-3.5">
        <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
          {content}
        </p>

        {/* Media Images Grid */}
        {mediaUrls && mediaUrls.length > 0 && (
          <div className={`rounded-xl overflow-hidden grid gap-2.5 ${mediaUrls.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {mediaUrls.map((url, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-gray-100 h-48 sm:h-56">
                <img 
                  src={url} 
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-300 cursor-pointer" 
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
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-gray-500">
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
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-[#5D22D7] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{stats?.replies || 0}</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-green-600 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{stats?.shares || 0}</span>
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
    </article>
  );
}
