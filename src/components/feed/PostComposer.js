"use client";

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Calendar, BarChart2, X, Plus } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useUser } from '@clerk/nextjs';

export default function PostComposer({ onPostCreated, profile }) {
  const { user } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Poll State
  const [isPoll, setIsPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('1 Day');
  const [allowMultiple, setAllowMultiple] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target)) {
        // If composer is completely empty, collapse it
        const isComposerEmpty = !content.trim() && !imageUrl && !isPoll;
        if (isComposerEmpty) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [content, imageUrl, isPoll]);

  const resetState = () => {
    setContent('');
    setImageUrl('');
    setIsPoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setAllowMultiple(false);
    setIsExpanded(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!isPoll && !content.trim() && !imageUrl) return;

    if (isPoll) {
      if (!pollQuestion.trim()) return alert("Poll question is required.");
      const validOptions = pollOptions.map(o => o.trim()).filter(o => o.length > 0);
      if (validOptions.length < 2) return alert("At least 2 options are required.");
      const uniqueOptions = new Set(validOptions);
      if (uniqueOptions.size !== validOptions.length) return alert("Duplicate options are not allowed.");
    }
    
    setLoading(true);
    try {
      const payload = {
        type: isPoll ? 'poll' : (imageUrl ? 'photo' : 'text'),
        content: isPoll ? '' : content,
        imageUrl: isPoll ? null : (imageUrl || null)
      };

      if (isPoll) {
        let expiresAt = null;
        const now = new Date();
        if (pollDuration === '1 Day') expiresAt = new Date(now.setDate(now.getDate() + 1));
        else if (pollDuration === '3 Days') expiresAt = new Date(now.setDate(now.getDate() + 3));
        else if (pollDuration === '1 Week') expiresAt = new Date(now.setDate(now.getDate() + 7));

        payload.pollData = {
          question: pollQuestion.trim(),
          allowMultipleSelection: allowMultiple,
          expiresAt,
          options: pollOptions.map(o => o.trim()).filter(o => o.length > 0).map((text, i) => ({ text, displayOrder: i }))
        };
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create post');
      }

      const newPost = await res.json();

      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-stats-updated'));
      }
      
      resetState();
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const updateOption = (index, val) => {
    const newOptions = [...pollOptions];
    newOptions[index] = val;
    setPollOptions(newOptions);
  };

  const isPostDisabled = loading || (isPoll ? (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) : (!content.trim() && !imageUrl));

  if (!isExpanded) {
    return (
      <div 
        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 cursor-text transition-shadow hover:shadow-md"
        onClick={() => setIsExpanded(true)}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100 shadow-sm">
          <img 
            src={profile?.profile?.photo || user?.imageUrl || "/default-avatar.png"} 
            alt={profile?.profile?.name || user?.firstName || "User"} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-500 font-medium">
          What's on your mind, {profile?.profile?.name?.split(' ')[0] || user?.firstName || 'there'}?
        </div>
        <div className="flex gap-2 text-gray-400">
          <ImageIcon className="w-5 h-5 hover:text-blue-500 transition-colors" />
          <BarChart2 className="w-5 h-5 hover:text-amber-500 transition-colors" />
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100 shadow-sm">
            <img 
              src={profile?.profile?.photo || user?.imageUrl || "/default-avatar.png"} 
              alt={profile?.profile?.name || user?.firstName || "User"} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-3 pt-1">
            {!isPoll ? (
              <>
                <textarea
                  autoFocus
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`What's on your mind, ${profile?.profile?.name?.split(' ')[0] || user?.firstName || 'there'}?`}
                  className="w-full bg-transparent text-base text-gray-800 placeholder-gray-400 outline-none resize-none min-h-[100px]"
                />
                {imageUrl && (
                  <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-gray-100 shadow-sm mt-2">
                    <img src={imageUrl.includes('res.cloudinary.com') ? imageUrl.replace('/upload/', '/upload/f_auto,q_auto/') : imageUrl} alt="Upload preview" className="w-full h-auto object-cover max-h-[300px]" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all backdrop-blur-sm shadow-lg hover:scale-105"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100 space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-[15px] text-gray-900 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#5D22D7]" />
                    Build your Poll
                  </h3>
                  <button type="button" onClick={() => setIsPoll(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <input
                  autoFocus
                  type="text"
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={e => setPollQuestion(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#5D22D7] focus:ring-1 focus:ring-[#5D22D7] shadow-xs"
                  required
                />
                
                <div className="space-y-2.5">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={e => updateOption(i, e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5D22D7] shadow-xs"
                        required={i < 2}
                      />
                      {pollOptions.length > 2 && (
                        <button type="button" onClick={() => handleRemoveOption(i)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#5D22D7] hover:bg-[#F0EBFD] px-3 py-2 rounded-lg transition-colors mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add option
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-blue-100/50">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Poll Duration</label>
                    <select
                      value={pollDuration}
                      onChange={e => setPollDuration(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#5D22D7] shadow-xs"
                    >
                      <option value="1 Day">1 Day</option>
                      <option value="3 Days">3 Days</option>
                      <option value="1 Week">1 Week</option>
                      <option value="No expiry">No expiry</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 flex items-center pt-2 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={allowMultiple}
                        onChange={e => setAllowMultiple(e.target.checked)}
                        className="w-4 h-4 rounded text-[#5D22D7] focus:ring-[#5D22D7] border-gray-300 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Allow multiple answers</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 sm:gap-2">
            {!isPoll && (
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
                onSuccess={(result) => {
                  if (result?.info?.secure_url) {
                    setImageUrl(result.info.secure_url);
                  }
                }}
                options={{ multiple: false, resourceType: "image", cropping: true, croppingCoordinatesMode: "custom", showSkipCropButton: false }}
              >
                {({ open }) => (
                  <button 
                    type="button" 
                    onClick={() => open?.()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-blue-50/80 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    <div className="p-1.5 bg-blue-100/50 rounded-lg text-blue-600">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline">Photo / Video</span>
                  </button>
                )}
              </CldUploadWidget>
            )}

            {!isPoll && (
              <button 
                type="button" 
                onClick={() => setIsPoll(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-amber-50/80 hover:text-amber-600 transition-colors text-sm font-medium"
              >
                <div className="p-1.5 bg-amber-100/50 rounded-lg text-amber-600">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">Poll</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={resetState}
              className="text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isPostDisabled}
              className="bg-[#5D22D7] hover:bg-[#4C1D95] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(93,34,215,0.25)] hover:shadow-[0_6px_20px_rgba(93,34,215,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
