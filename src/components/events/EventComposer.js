"use client";

import { useState, useEffect } from 'react';
import { Image as ImageIcon, MapPin, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useUser } from '@clerk/nextjs';

export default function EventComposer({ onEventCreated, userProfile }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dateTime: '',
    mode: 'offline',
    venue: '',
    meetingLink: '',
    college: '',
    category: 'Other',
    coverImageUrl: '',
    registrationLink: '',
    contactInfo: ''
  });

  const categories = ['Tech', 'Cultural', 'Sports', 'Career', 'Workshop', 'Other'];

  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setColleges(data);
          if (userProfile?.profile?.college?._id) {
            setFormData(prev => ({ ...prev, college: userProfile.profile.college._id }));
          } else if (data.length > 0) {
            setFormData(prev => ({ ...prev, college: data[0]._id }));
          }
        }
      })
      .catch(console.error);
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create event');
      }

      const newEvent = await res.json();

      if (onEventCreated) {
        onEventCreated(newEvent);
      }
      
      setFormData({
        name: '',
        description: '',
        dateTime: '',
        mode: 'offline',
        venue: '',
        meetingLink: '',
        college: formData.college,
        category: 'Other',
        coverImageUrl: '',
        registrationLink: '',
        contactInfo: ''
      });
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100 shadow-sm hidden sm:block">
            <img 
              src={userProfile?.profile?.photo || user?.imageUrl || "/default-avatar.png"} 
              alt={userProfile?.profile?.name || user?.firstName || "User"} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex-1 w-full min-w-0">
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Event Name"
              className="w-full bg-transparent text-lg font-bold text-gray-900 placeholder-gray-400 outline-none mb-2"
            />
            
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What's this event about?"
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none min-h-[60px] mb-2"
              rows={Math.max(2, formData.description.split('\n').length)}
            />
            
            {/* Event Cover Image Preview */}
            {formData.coverImageUrl && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-3">
                <img src={formData.coverImageUrl.includes('res.cloudinary.com') ? formData.coverImageUrl.replace('/upload/', '/upload/f_auto,q_auto/') : formData.coverImageUrl} alt="Upload preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, coverImageUrl: '' }))}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all backdrop-blur-sm shadow-lg hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Date & Time</label>
                <input
                  required
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2 outline-none"
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2 outline-none"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">College</label>
                <select
                  required
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2 outline-none"
                >
                  <option value="">Select College</option>
                  {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Mode</label>
                <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mode: 'offline' }))}
                    className={`flex-1 text-sm py-1 rounded-lg transition-colors ${formData.mode === 'offline' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Offline
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mode: 'online' }))}
                    className={`flex-1 text-sm py-1 rounded-lg transition-colors ${formData.mode === 'online' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Online
                  </button>
                </div>
              </div>
              
              {formData.mode === 'offline' ? (
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Venue</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      required
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="Room 101, Main Block..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block pl-10 p-2 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Meeting Link</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      required
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      placeholder="https://zoom.us/j/123..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block pl-10 p-2 outline-none"
                    />
                  </div>
                </div>
              )}
              
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">External Registration Link (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="registrationLink"
                    value={formData.registrationLink}
                    onChange={handleChange}
                    placeholder="https://lu.ma/..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block pl-10 p-2 outline-none"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Leave blank if anyone can just show up without registering.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Contact Information (Optional)</label>
                <textarea
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="Email / Phone numbers"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2 outline-none min-h-[60px]"
                  rows="2"
                />
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Divider & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1 sm:gap-2">
            
            <CldUploadWidget 
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
              onSuccess={(result) => {
                if (result?.info?.secure_url) {
                  setFormData(prev => ({ ...prev, coverImageUrl: result.info.secure_url }));
                }
              }}
              options={{
                multiple: false,
                resourceType: "image",
                cropping: true,
                croppingAspectRatio: 16/9,
                showSkipCropButton: false
              }}
            >
              {({ open }) => {
                return (
                  <button 
                    type="button" 
                    onClick={() => open?.()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-blue-50/80 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    <div className="p-1.5 bg-blue-100/50 rounded-lg text-blue-600">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline">Cover Image</span>
                  </button>
                );
              }}
            </CldUploadWidget>

          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#5D22D7] hover:bg-[#4C1D95] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(93,34,215,0.25)] hover:shadow-[0_6px_20px_rgba(93,34,215,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer flex items-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Posting...</> : "Post Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
