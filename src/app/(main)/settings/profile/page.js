"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { Loader2, ArrowLeft, Save, Camera } from 'lucide-react';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';

export default function EditProfilePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
  const userType = user?.publicMetadata?.user_type;
  const isProspective = userType === 'prospective';

  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    college: '',
    course: '',
    department: '',
    yearOfStudy: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch initial profile
  useEffect(() => {
    fetch('/api/users/me/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData({
            name: data.profile?.name || '',
            photo: data.profile?.photo || '',
            college: data.profile?.college?._id || '',
            course: data.profile?.course || '',
            department: data.profile?.department || '',
            yearOfStudy: data.profile?.yearOfStudy || '',
            bio: data.profile?.bio || ''
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch colleges
  useEffect(() => {
    if (!isProspective) {
      fetch('/api/colleges')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setColleges(data);
        })
        .catch(console.error)
        .finally(() => setCollegesLoading(false));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollegesLoading(false);
    }
  }, [isProspective]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      const res = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      await getToken({ skipCache: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings" className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-text-main">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-text-main">Edit Profile</h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-100">Profile updated successfully!</div>}
      
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-md bg-gray-100">
                <img 
                  src={formData.photo || user?.imageUrl || "https://i.pravatar.cc/150?img=11"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
                onSuccess={(result) => {
                  if (result?.info?.secure_url) {
                    const url = result.info.secure_url;
                    setFormData(prev => ({
                      ...prev, 
                      photo: url.includes('res.cloudinary.com') ? url.replace('/upload/', '/upload/f_auto,q_auto/') : url
                    }));
                  }
                }}
                options={{ multiple: false, resourceType: "image", maxFiles: 1 }}
              >
                {({ open }) => (
                  <button 
                    type="button" 
                    onClick={() => open?.()}
                    className="absolute bottom-0 right-0 p-2 bg-[#5D22D7] text-white rounded-full shadow-lg hover:bg-[#4C1D95] transition-colors hover:scale-105 active:scale-95"
                    title="Change Profile Picture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </CldUploadWidget>
            </div>
            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
              <h3 className="font-bold text-gray-900 text-lg">Profile Picture</h3>
              <p className="text-sm text-gray-500 mt-1">Upload a clear photo of yourself. This will be visible to your peers and mentors.</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-bold text-text-main mb-1.5">Full Name</label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-background"
              placeholder="John Doe"
            />
          </div>

          {isProspective ? (
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">About You (optional)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-background min-h-[100px] resize-y"
                placeholder="What colleges or programs are you exploring?"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">College / University</label>
                {collegesLoading ? (
                  <div className="w-full p-3 border border-border-light rounded-xl bg-background flex items-center gap-3 text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading colleges...
                  </div>
                ) : (
                  <select
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                    className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-background"
                  >
                    <option value="">Select your college...</option>
                    {colleges.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1.5">Course / Degree</label>
                  <select
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-background"
                  >
                    <option value="">Select course...</option>
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                    <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                    <option value="B.A.">B.A. (Bachelor of Arts)</option>
                    <option value="B.B.A.">B.B.A. (Bachelor of Business Admin)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                    <option value="MBA">MBA (Master of Business Admin)</option>
                    <option value="PhD">PhD (Doctorate)</option>
                    <option value="Other">Other Degree</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main mb-1.5">Year of Study</label>
                  <select
                    required
                    value={formData.yearOfStudy}
                    onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
                    className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-background"
                  >
                    <option value="">Select year...</option>
                    <option value="First Year">First Year (1st)</option>
                    <option value="Second Year">Second Year (2nd)</option>
                    <option value="Third Year">Third Year (3rd)</option>
                    <option value="Fourth Year">Fourth Year (4th)</option>
                    <option value="Fifth Year">Fifth Year (5th)</option>
                    <option value="Alumni">Alumni / Graduated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">Department / Branch</label>
                <input 
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-background"
                  placeholder="e.g. Computer Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-background min-h-[100px] resize-y"
                  placeholder="Tell us a little about yourself..."
                />
              </div>
            </>
          )}
          
          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
