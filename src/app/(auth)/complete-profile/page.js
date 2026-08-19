"use client";

import { useState } from 'react';
import AuthShell from '@/components/layout/AuthShell';
import { useAuth, useUser } from '@clerk/nextjs';

export default function CompleteProfile() {
  const { user } = useUser();
  const userType = user?.publicMetadata?.user_type;
  const isProspective = userType === 'prospective';

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    yearOfStudy: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

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
            className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary"
            placeholder="John Doe"
          />
        </div>

        {isProspective ? (
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">About You (optional)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary resize-none"
              rows={3}
              placeholder="What colleges or programs are you exploring?"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Department</label>
              <input 
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary"
                placeholder="Computer Science"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Year of Study</label>
              <input 
                type="text"
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
                className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary"
                placeholder="Sophomore"
              />
            </div>
          </>
        )}
        
        <button 
          type="submit"
          disabled={loading || !formData.name}
          className="w-full p-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </AuthShell>
  );
}
