"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const TOPICS = [
  "Academics", 
  "Hostel & Campus Life", 
  "Placements", 
  "Clubs & Societies", 
  "Admissions Process", 
  "Other"
];

export default function AmbassadorApplyPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null); // 'checking' | null | { status, cooldownUntil }

  const [formData, setFormData] = useState({
    yearOfStudy: '',
    department: '',
    reason: '',
    topics: [],
    availability: ''
  });

  useEffect(() => {
    if (isLoaded && user) {
      checkExistingApplication();
    }
  }, [isLoaded, user]);

  const checkExistingApplication = async () => {
    try {
      const res = await fetch('/api/ambassador/apply/check');
      if (res.ok) {
        const data = await res.json();
        setApplicationStatus(data);
        if (data.userProfile) {
          setFormData(prev => ({
            ...prev,
            yearOfStudy: data.userProfile.yearOfStudy || '',
            department: data.userProfile.department || ''
          }));
        }
      }
    } catch (err) {
      console.error("Error checking status", err);
    }
  };

  const handleTopicToggle = (topic) => {
    setFormData(prev => {
      const isSelected = prev.topics.includes(topic);
      if (isSelected) {
        return { ...prev, topics: prev.topics.filter(t => t !== topic) };
      } else {
        return { ...prev, topics: [...prev.topics, topic] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.topics.length === 0) {
      setError("Please select at least one topic you can help with.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ambassador/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || applicationStatus === 'checking') {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }

  const isCurrentStudent = user?.publicMetadata?.user_type === 'current';
  const isVerified = user?.publicMetadata?.status === 'verified';

  if (!isCurrentStudent || !isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
          <ShieldCheck className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-6">
            Only verified current students can apply to be Campus Ambassadors. Please verify your student status in your profile first.
          </p>
          <Link href="/profile" className="inline-block bg-[#5D22D7] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#4C1D95] transition-colors">
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Handle existing statuses
  if (applicationStatus?.status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You are an Ambassador!</h2>
        <p className="text-gray-600">Your application was already approved. You are currently an active Campus Ambassador.</p>
      </div>
    );
  }

  if (applicationStatus?.status === 'pending_review' || success) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-gray-600">
            {success ? "Your application has been submitted successfully! " : ""}
            Our team is currently reviewing your ambassador application. We will notify you once a decision is made.
          </p>
        </div>
      </div>
    );
  }

  if (applicationStatus?.status === 'rejected' && applicationStatus?.cooldownUntil) {
    const cooldownDate = new Date(applicationStatus.cooldownUntil);
    if (cooldownDate > new Date()) {
      return (
        <div className="max-w-2xl mx-auto py-10 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Accepted</h2>
          <p className="text-gray-600 mb-4">Unfortunately, your previous application was not accepted at this time.</p>
          <div className="inline-block bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold">
            You can reapply on {format(cooldownDate, 'MMMM do, yyyy')}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <Link href="/ambassadors" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Ambassadors
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-[#5D22D7] to-[#7B2CBF] text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Become a Campus Ambassador</h1>
          <p className="text-white/80">Help prospective students navigate college life, answer questions, and earn points on your profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Year of Study</label>
              <input
                type="text"
                required
                placeholder="e.g. 3rd Year"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all"
                value={formData.yearOfStudy}
                onChange={e => setFormData({...formData, yearOfStudy: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Department</label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Why do you want to be an Ambassador?</label>
            <textarea
              required
              rows={4}
              placeholder="Tell us about your campus experience and why you'd be a great guide for prospective students..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all resize-none"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Topics you can help with (Select all that apply)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOPICS.map(topic => (
                <label key={topic} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.topics.includes(topic) ? 'bg-[#5D22D7]/5 border-[#5D22D7] text-[#5D22D7]' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#5D22D7] focus:ring-[#5D22D7]"
                    checked={formData.topics.includes(topic)}
                    onChange={() => handleTopicToggle(topic)}
                  />
                  <span className="text-sm font-medium">{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Availability (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Usually reply within a day, free on weekends"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all"
              value={formData.availability}
              onChange={e => setFormData({...formData, availability: e.target.value})}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5D22D7] text-white py-3 rounded-xl font-bold hover:bg-[#4C1D95] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
