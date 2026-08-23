"use client";

import { useState, useEffect } from 'react';
import AuthShell from '@/components/layout/AuthShell';
import { Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';

export default function VerificationPending() {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user && user.publicMetadata.status === 'verified') {
      window.location.replace('/complete-profile');
    }
  }, [isLoaded, user]);

  const handleCheckStatus = async () => {
    setLoading(true);
    // Force a fresh token from Clerk which contains updated publicMetadata
    await getToken({ skipCache: true });
    // Go to home so the main layout interceptor can route us correctly
    window.location.replace('/');
  };

  return (
    <AuthShell title="Verification Pending" subtitle="We're reviewing your information.">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6 relative">
          <Clock className="w-8 h-8 text-amber-600" />
          {loading && (
            <div className="absolute inset-0 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
          )}
        </div>
        <p className="text-gray-600 mb-6">
          Your account is currently under review by our moderation team. You&apos;ll be notified once your verification is approved!
        </p>

        <div className="space-y-3 mb-6">
          <button 
            onClick={handleCheckStatus}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={\ w-4 h-4} />
            Check Status Now
          </button>
        </div>

        <Link href="/admin" className="text-[#5D22D7] font-bold hover:underline text-sm">
          Are you an admin? Go to Admin Panel
        </Link>
      </div>
    </AuthShell>
  );
}
