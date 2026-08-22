"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/layout/AuthShell';
import { useAuth } from '@clerk/nextjs';

export default function RoleSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Explicitly import getToken to manually refresh session after metadata change
  const { getToken } = useAuth();

  const handleRoleSelect = async (role) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      if (!res.ok) {
        throw new Error('Failed to update role');
      }

      await getToken({ skipCache: true });

      // Route each role to the correct next onboarding step
      const destination = role === 'prospective' ? '/complete-profile' : '/verify-email';
      window.location.replace(destination);
      
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome to Campus Collab" subtitle="Tell us a bit about yourself.">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      
      <div className="space-y-4">
        <button 
          onClick={() => handleRoleSelect('current')}
          disabled={loading}
          className="w-full p-4 border-2 border-border-light rounded-xl hover:border-primary bg-white hover:bg-gray-50 transition-all text-left flex flex-col disabled:opacity-50"
        >
          <span className="font-bold text-gray-900">Current Student</span>
          <span className="text-sm text-gray-500">I am currently enrolled in a college or university.</span>
        </button>

        <button 
          onClick={() => handleRoleSelect('prospective')}
          disabled={loading}
          className="w-full p-4 border-2 border-border-light rounded-xl hover:border-primary bg-white hover:bg-gray-50 transition-all text-left flex flex-col disabled:opacity-50"
        >
          <span className="font-bold text-gray-900">Prospective Student</span>
          <span className="text-sm text-gray-500">I am looking to explore colleges and connect with mentors.</span>
        </button>
      </div>
    </AuthShell>
  );
}
