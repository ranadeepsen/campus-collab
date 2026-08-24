"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';
import { ArrowLeft, Upload, Loader2, Info, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ["Tech", "Cultural", "Sports", "Arts", "Career", "Other"];

export default function CreateClubPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Tech',
    joinMode: 'request',
    proofText: '',
    coverImageUrl: '',
    logoUrl: '',
    proofFileUrl: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: ''
  });

  if (!isLoaded) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const canCreate = user?.publicMetadata?.user_type === 'current' && user?.publicMetadata?.status === 'verified';
  const collegeId = user?.publicMetadata?.college_id;

  if (!canCreate) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">Only verified current students can create clubs.</p>
        <Link href="/clubs" className="text-[#5D22D7] font-semibold hover:underline">
          Return to Clubs
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          collegeId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create club');

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Club Submitted!</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your club <strong>{formData.name}</strong> is currently under review by our platform administrators. We'll notify you once it's approved and visible to the campus.
          </p>
          <Link 
            href="/clubs" 
            className="inline-block bg-[#5D22D7] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#4C1D95] transition-colors"
          >
            Back to Clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create a New Club</h1>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Club Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics Club"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Category</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all appearance-none bg-white"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What is your club about? What do you do?"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Club Logo (Optional)</label>
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
                    onSuccess={(res) => setFormData({...formData, logoUrl: res.info.secure_url})}
                  >
                    {({ open }) => (
                      <div 
                        onClick={() => open()} 
                        className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#5D22D7] cursor-pointer transition-all h-32"
                      >
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-2xl shadow-sm mb-2" />
                        ) : (
                          <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                        )}
                        <span className="text-xs font-semibold">{formData.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                      </div>
                    )}
                  </CldUploadWidget>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Cover Wallpaper (Optional)</label>
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
                    onSuccess={(res) => setFormData({...formData, coverImageUrl: res.info.secure_url})}
                  >
                    {({ open }) => (
                      <div 
                        onClick={() => open()} 
                        className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#5D22D7] cursor-pointer transition-all h-32 relative overflow-hidden"
                      >
                        {formData.coverImageUrl ? (
                          <>
                            <img src={formData.coverImageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            <div className="relative z-10 bg-white/80 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm">Change Cover</div>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                            <span className="text-xs font-semibold">Upload Wallpaper</span>
                          </>
                        )}
                      </div>
                    )}
                  </CldUploadWidget>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Links & Social Media</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Website (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://your-club-website.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Instagram</label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all"
                      value={formData.instagram}
                      onChange={e => setFormData({...formData, instagram: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Facebook</label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all"
                      value={formData.facebook}
                      onChange={e => setFormData({...formData, facebook: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Twitter / X</label>
                    <input
                      type="url"
                      placeholder="https://x.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all"
                      value={formData.twitter}
                      onChange={e => setFormData({...formData, twitter: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Joining Rules</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.joinMode === 'open' ? 'border-[#5D22D7] bg-[#5D22D7]/5 ring-1 ring-[#5D22D7]' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <input type="radio" name="joinMode" value="open" checked={formData.joinMode === 'open'} onChange={() => setFormData({...formData, joinMode: 'open'})} className="accent-[#5D22D7]" />
                    <span className="font-semibold text-gray-900">Open to All</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-7">Anyone can join instantly with one click.</p>
                </label>
                
                <label className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.joinMode === 'request' ? 'border-[#5D22D7] bg-[#5D22D7]/5 ring-1 ring-[#5D22D7]' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <input type="radio" name="joinMode" value="request" checked={formData.joinMode === 'request'} onChange={() => setFormData({...formData, joinMode: 'request'})} className="accent-[#5D22D7]" />
                    <span className="font-semibold text-gray-900">Request to Join</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-7">Admins must approve new members first.</p>
                </label>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-100">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>To ensure platform quality, all new clubs must be reviewed. Please provide evidence that this club is legitimate and recognized by your college.</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Proof of Legitimacy <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="How is this club officially recognized? e.g., registered with student council, has a faculty advisor (Name/Email), or links to social media."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all resize-none"
                  value={formData.proofText}
                  onChange={e => setFormData({...formData, proofText: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5D22D7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4C1D95] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
