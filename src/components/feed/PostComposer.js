"use client";

import { useState } from 'react';
import { Image as ImageIcon, Calendar, BarChart2, X } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useUser } from '@clerk/nextjs';

export default function PostComposer({ onPostCreated }) {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl || loading) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: imageUrl ? 'photo' : 'text',
          content: content,
          imageUrl: imageUrl || null
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create post');
      }

      const newPost = await res.json();

      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      setContent('');
      setImageUrl('');
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="post-composer" className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Top Input Area */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0 mt-1">
            <img 
              src={user?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
              alt={user?.firstName || "User"} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${user?.firstName || 'there'}?`}
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none pt-2"
              rows={Math.max(1, content.split('\\n').length)}
            />

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-gray-200">
                <img src={imageUrl} alt="Upload preview" className="w-full h-auto object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Divider & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Cloudinary Upload Button */}
            <CldUploadWidget 
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
              onSuccess={(result) => {
                if (result?.info?.secure_url) {
                  setImageUrl(result.info.secure_url);
                }
              }}
              options={{
                multiple: false,
                resourceType: "image",
              }}
            >
              {({ open }) => {
                return (
                  <button 
                    type="button" 
                    onClick={() => open?.()}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-xs font-semibold"
                  >
                    <ImageIcon className="w-4 h-4 text-[#5D22D7]" />
                    <span>Photo / Video</span>
                  </button>
                );
              }}
            </CldUploadWidget>

            <button 
              type="button" 
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-xs font-semibold"
            >
              <Calendar className="w-4 h-4 text-[#5D22D7]" />
              <span>Event</span>
            </button>
            <button 
              type="button" 
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-xs font-semibold"
            >
              <BarChart2 className="w-4 h-4 text-[#5D22D7]" />
              <span>Poll</span>
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={loading || (!content.trim() && !imageUrl)}
            className="bg-[#5D22D7] hover:bg-[#4C1D95] text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_2px_10px_rgba(93,34,215,0.25)] hover:shadow-[0_4px_16px_rgba(93,34,215,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
