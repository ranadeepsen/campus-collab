"use client";

import { useState, useEffect } from 'react';
import AuthShell from '@/components/layout/AuthShell';
import { useAuth, useUser } from '@clerk/nextjs';
import { CldUploadWidget } from 'next-cloudinary';
import { Mail, FileText, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'document'
  
  // Email Flow State
  const [email, setEmail] = useState('');
  const [collegeId, setCollegeId] = useState(null);
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [emailAddressObj, setEmailAddressObj] = useState(null);
  
  // Shared State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user && !user.publicMetadata.user_type) {
      window.location.replace('/role-selection');
    }
  }, [isLoaded, user]);



  // 1. Submit email to check domain and start Clerk flow
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Check domain first
      const res = await fetch('/api/users/verify/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      if (data.matched) {
        setCollegeId(data.collegeId);
        
        // Start Clerk Email OTP Flow
        const emailAddress = await user.createEmailAddress({ email });
        await emailAddress.prepareVerification({ strategy: 'email_code' });
        
        setEmailAddressObj(emailAddress);
        setPendingVerification(true);
        setSuccess('Verification code sent to your email!');
      } else {
        setError(data.error || 'College email domain not recognized.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Clerk OTP
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Verify with Clerk
      const verifyAttempt = await emailAddressObj.attemptVerification({ code });
      
      if (verifyAttempt.verification.status === 'verified') {
        // Finalize on our backend
        const res = await fetch('/api/users/verify/email', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collegeId })
        });
        
        if (!res.ok) throw new Error('Failed to finalize verification');
        
        setSuccess('Email verified successfully!');
        await getToken({ skipCache: true }); // refresh claims
        window.location.replace('/complete-profile');
      } else {
        setError('Invalid verification code.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Document Upload Completion
  const handleDocumentUpload = async (result) => {
    setLoading(true);
    setError('');
    try {
      const documentUrl = result.info.secure_url;
      
      const res = await fetch('/api/users/verify/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrl })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit document');
      
      await getToken({ skipCache: true });
      window.location.replace('/verification-pending');
    } catch (err) {
      setError(err.message || 'Failed to process document. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Verify Student Status" subtitle="Choose how you'd like to verify your enrollment.">
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('email'); setError(''); setSuccess(''); }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'email' ? 'bg-[#F0EBFD] text-[#5D22D7] border border-[#5D22D7]/20' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          <Mail className="w-4 h-4" />
          College Email
        </button>
        <button
          onClick={() => { setActiveTab('document'); setError(''); setSuccess(''); }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'document' ? 'bg-[#F0EBFD] text-[#5D22D7] border border-[#5D22D7]/20' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          <FileText className="w-4 h-4" />
          ID Card
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm">{success}</div>}
      
      {activeTab === 'email' ? (
        <div className="space-y-4">
          {!pendingVerification ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">College Email Address</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-border-light rounded-xl focus:outline-none focus:border-primary"
                  placeholder="student@college.edu"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !email}
                className="w-full p-3 bg-[#5D22D7] text-white rounded-xl font-bold hover:bg-[#4C1D95] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Instant access. We'll send a 6-digit code to this address.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Verification Code</label>
                <input 
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-3 text-center tracking-[0.5em] font-bold text-lg border border-border-light rounded-xl focus:outline-none focus:border-primary"
                  placeholder="------"
                  maxLength={6}
                />
              </div>
              <button 
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full p-3 bg-[#5D22D7] text-white rounded-xl font-bold hover:bg-[#4C1D95] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
              </button>
              <button 
                type="button"
                onClick={() => setPendingVerification(false)}
                className="w-full p-2 text-sm text-gray-500 hover:underline"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-800 font-medium text-left">
              Don't have a college email yet? Upload a clear photo of your Student ID card or admission letter. This method requires manual review by an admin.
            </p>
          </div>
          
          <CldUploadWidget 
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
            onSuccess={handleDocumentUpload}
          >
            {({ open }) => {
              return (
                <button 
                  type="button"
                  onClick={() => open()}
                  disabled={loading}
                  className="w-full p-4 border-2 border-dashed border-[#5D22D7]/30 bg-[#F0EBFD]/50 hover:bg-[#F0EBFD] rounded-xl font-bold text-[#5D22D7] transition-all flex flex-col items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <FileText className="w-8 h-8 opacity-70" />
                      <span>Click to Upload ID Document</span>
                    </>
                  )}
                </button>
              );
            }}
          </CldUploadWidget>

          <button 
            type="button"
            onClick={() => handleDocumentUpload({ info: { secure_url: 'https://dummyimage.com/600x400/ccc/000.png&text=Dev+ID+Upload' } })}
            disabled={loading}
            className="w-full mt-2 p-2 text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Skip Upload (Dev Only)
          </button>
        </div>
      )}
    </AuthShell>
  );
}
