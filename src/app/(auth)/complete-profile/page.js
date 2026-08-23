"use client";

import { useState, useEffect } from 'react';
import AuthShell from '@/components/layout/AuthShell';
import { useAuth, useUser } from '@clerk/nextjs';
import { Loader2, Camera } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

export default function CompleteProfile() {
  const { user } = useUser();
  const userType = user?.publicMetadata?.user_type;
  const isProspective = userType === 'prospective';

  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [isCollegeLocked, setIsCollegeLocked] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    college: '',
    customCollege: '',
    course: '',
    department: '',
    yearOfStudy: '',
    bio: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

  useEffect(() => {
    fetch('/api/users/me/profile')
      .then(res => res.json())
      .then(data => {
        if (data.profile?.college) {
          setFormData(prev => ({ ...prev, college: data.profile.college._id }));
          setIsCollegeLocked(true);
        } else if (data.customCollegeRequest) {
          setFormData(prev => ({ ...prev, college: 'other', customCollege: data.customCollegeRequest }));
          setIsCollegeLocked(true);
        }
      })
      .catch(console.error);

    if (!isProspective) {
      fetch('/api/colleges')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setColleges(data);
        })
        .catch(console.error)
        .finally(() => setCollegesLoading(false));
    } else {
      setCollegesLoading(false);
    }
  }, [isProspective]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      window.location.replace('/');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Complete Profile" subtitle="Almost there! Let's get to know you.">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Profile Photo (Optional) */}
        <div className="flex flex-col items-center justify-center py-2">
          <CldUploadWidget 
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
            onSuccess={(result) => setFormData({...formData, photo: result.info.secure_url})}
          >
            {({ open }) => (
              <button 
                type="button" 
                onClick={() => open()}
                className="group relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden hover:border-[#5D22D7] transition-colors"
              >
                {formData.photo ? (
                  <Image src={formData.photo} alt="Profile" fill className="object-cover" sizes="96px" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-gray-400 group-hover:text-[#5D22D7] mb-1" />
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#5D22D7]">Add Photo</span>
                  </>
                )}
                {formData.photo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            )}
          </CldUploadWidget>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Full Name</label>
          <input 
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900"
            placeholder="Enter your name"
          />
        </div>

        {!isProspective && (
          <>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">College / University</label>
              {collegesLoading ? (
                <div className="w-full p-3 border border-border-light rounded-xl bg-gray-50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted" />
                </div>
              ) : (
                <select
                  required
                  disabled={isCollegeLocked}
                  value={formData.college}
                  onChange={(e) => {
                    setFormData({...formData, college: e.target.value, department: '', customCollege: ''});
                  }}
                  className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900 disabled:bg-gray-100 disabled:opacity-70"
                >
                  <option value="">Select your college...</option>
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                  <option value="other" className="font-bold">Other / My college is not listed</option>
                </select>
              )}
            </div>

            {formData.college === 'other' && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-1">College Name</label>
                  <input 
                    type="text"
                    required
                    disabled={isCollegeLocked}
                    value={formData.customCollege}
                    onChange={(e) => setFormData({...formData, customCollege: e.target.value})}
                    className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-gray-900 disabled:bg-blue-50 disabled:opacity-70"
                    placeholder="Enter your college's full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Course / Degree</label>
              <select
                required
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900"
              >
                <option value="">Select your course...</option>
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
              <label className="block text-sm font-medium text-text-main mb-1">Department / Branch</label>
              {(() => {
                const selectedCollegeObj = colleges.find(c => c._id === formData.college);
                const availableDepartments = selectedCollegeObj?.departments || [];
                
                if (availableDepartments.length > 0 && formData.college !== 'other') {
                  return (
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900"
                    >
                      <option value="">Select your department...</option>
                      {availableDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                      <option value="Other">Other / Not Listed</option>
                    </select>
                  );
                } else {
                  return (
                    <input 
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900"
                      placeholder="e.g. Computer Science"
                    />
                  );
                }
              })()}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Year of Study</label>
              <select
                required
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
                className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900"
              >
                <option value="">Select current year...</option>
                <option value="First Year">First Year (1st)</option>
                <option value="Second Year">Second Year (2nd)</option>
                <option value="Third Year">Third Year (3rd)</option>
                <option value="Fourth Year">Fourth Year (4th)</option>
                <option value="Fifth Year">Fifth Year (5th)</option>
                <option value="Alumni">Alumni / Graduated</option>
              </select>
            </div>
          </>
        )}

        {/* Bio available to everyone */}
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">About You (optional)</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900 resize-none"
            rows={3}
            placeholder={isProspective ? "What colleges or programs are you exploring?" : "Tell us a little about yourself..."}
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading || !formData.name || (!isProspective && (!formData.college || !formData.course || !formData.yearOfStudy))}
          className="w-full p-3 bg-[#5D22D7] text-white rounded-xl font-bold hover:bg-[#4C1D95] transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </AuthShell>
  );
}
