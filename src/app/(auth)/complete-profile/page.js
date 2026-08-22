"use client";

import { useState, useEffect } from 'react';
import AuthShell from '@/components/layout/AuthShell';
import { useAuth, useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function CompleteProfile() {
  const { user } = useUser();
  const userType = user?.publicMetadata?.user_type;
  const isProspective = userType === 'prospective';

  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    college: '',
    course: '',
    department: '',
    yearOfStudy: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

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

        {isProspective ? (
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">About You (optional)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900 resize-none"
              rows={3}
              placeholder="What colleges or programs are you exploring?"
            />
          </div>
        ) : (
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
                  value={formData.college}
                  onChange={(e) => {
                    setFormData({...formData, college: e.target.value, department: ''});
                  }}
                  className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary bg-white text-gray-900"
                >
                  <option value="">Select your college...</option>
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

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
                
                if (availableDepartments.length > 0) {
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
        
        <button 
          type="submit"
          disabled={loading || !formData.name || (!isProspective && (!formData.college || !formData.course || !formData.yearOfStudy))}
          className="w-full p-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </AuthShell>
  );
}
