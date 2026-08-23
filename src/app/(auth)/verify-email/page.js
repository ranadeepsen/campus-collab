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
  
  // Document Flow State
  const [colleges, setColleges] = useState([]);
  const [selectedDocCollege, setSelectedDocCollege] = useState('');
  const [customDocCollege, setCustomDocCollege] = useState('');
  
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
    
    // Fetch colleges for document flow
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setColleges(data);
      })
      .catch(console.error);
  }, [isLoaded, user]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/users/verify/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      if (data.matched) {
        setCollegeId(data.collegeId);
        
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

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const verifyAttempt = await emailAddressObj.attemptVerification({ code });
      
      if (verifyAttempt.verification.status === 'verified') {
        const res = await fetch('/api/users/verify/email', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collegeId })
        });
        
        if (!res.ok) throw new Error('Failed to finalize verification');
        
        setSuccess('Email verified successfully!');
        await getToken({ skipCache: true });
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

  const handleDocumentUpload = async (result) => {
    setLoading(true);
    setError('');
    
    if (selectedDocCollege === 'other' && !customDocCollege.trim()) {
      setError('Please enter your college name');
      setLoading(false);
      return;
    }
    
    try {
      const documentUrl = result.info.secure_url;
      
      const payload = { 
        documentUrl, 
        collegeId: selectedDocCollege !== 'other' ? selectedDocCollege : null,
        customCollegeRequest: selectedDocCollege === 'other' ? customDocCollege : null
      };
      
      const res = await fetch('/api/users/verify/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('email'); setError(''); setSuccess(''); }}
          className={lex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors \}
        >
          <Mail className="w-4 h-4" />
          College Email
        </button>
        <button
          onClick={() => { setActiveTab('document'); setError(''); setSuccess(''); }}
          className={lex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors \}
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
                className="w-full p-2 text-sm text-gray-500 hover:underline w-full"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-left">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Your College</label>
            <select
              value={selectedDocCollege}
              onChange={(e) => setSelectedDocCollege(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5D22D7] bg-white text-gray-900"
            >
              <option value="">Choose a college...</option>
              {colleges.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
              <option value="other" className="font-bold">Other / My college is not listed</option>
            </select>
          </div>

          {selectedDocCollege === 'other' && (
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">College Name</label>
              <input 
                type="text"
                required
                value={customDocCollege}
                onChange={(e) => setCustomDocCollege(e.target.value)}
                className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter your college's full name"
              />
            </div>
          )}

          {selectedDocCollege && (
            <>
              <div className="bg-blue-50 rounded-xl p-4 my-2">
                <p className="text-sm text-blue-800 font-medium text-left">
                  Please upload your college verification document. This should be a clear photo of your Student ID card or an official admission letter that proves you are enrolled at your college.
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
                      disabled={loading || (selectedDocCollege === 'other' && !customDocCollege.trim())}
                      className="w-full p-4 border-2 border-dashed border-[#5D22D7]/30 bg-[#F0EBFD]/50 hover:bg-[#F0EBFD] rounded-xl font-bold text-[#5D22D7] transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <FileText className="w-8 h-8 opacity-70" />
                          <span>Click to Upload Verification Document</span>
                        </>
                      )}
                    </button>
                  );
                }}
              </CldUploadWidget>
            </>
          )}

        </div>
      )}
    </AuthShell>
  );
}
