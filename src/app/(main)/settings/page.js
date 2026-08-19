"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Settings, Mail, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const accountType = user?.publicMetadata?.user_type === 'prospective'
    ? 'Prospective Student'
    : 'Current Student';

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-text-main">Settings</h1>
        </div>
        <p className="text-muted">Manage your account and profile preferences.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Account Type</p>
            <p className="font-semibold text-text-main">{accountType}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Email</p>
            <p className="font-semibold text-text-main">{profile?.email || user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Display Name</p>
            <p className="font-semibold text-text-main">{profile?.profile?.name || user?.fullName || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Verification Status</p>
            <p className="font-semibold text-text-main capitalize">{profile?.status || user?.publicMetadata?.status || 'unknown'}</p>
          </div>
          <Link
            href="/complete-profile"
            className="inline-flex items-center gap-2 mt-2 text-sm font-bold text-primary hover:underline"
          >
            Edit profile details
          </Link>
        </div>
      )}
    </div>
  );
}
