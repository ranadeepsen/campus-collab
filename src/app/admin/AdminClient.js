"use client";

import { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, LogOut, Loader2, Users, Building2, Flag, Settings, Award, BarChart3, Image as ImageIcon, Mail } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import Link from 'next/link';

export function AccessDenied({ userEmail }) {
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-6">
          The account <strong>{userEmail}</strong> does not have administrator privileges.
        </p>
        <button 
          onClick={() => signOut({ redirectUrl: '/' })}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AdminDashboard({ adminRole }) {
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState('id_card'); // 'id_card' or 'email'
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/verify');
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      if (res.ok) {
        setQueue((prev) => prev.filter((q) => q._id !== requestId));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('Action failed');
    }
  };


  const filteredQueue = queue.filter(q => 
    activeTab === 'id_card' ? q.user?.verification_method === 'college_id_card' : q.user?.verification_method === 'college_email'
  );

  return (
    <>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Verification Queue</h1>
            <p className="text-gray-500 text-sm">Review pending student verifications.</p>
            
            {/* Tabs */}
            <div className="flex gap-2 mt-6 border-b border-gray-100 pb-px">
              <button 
                onClick={() => setActiveTab('id_card')}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-colors ${activeTab === 'id_card' ? 'border-[#5D22D7] text-[#5D22D7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <ImageIcon className="w-4 h-4" />
                ID Card Submissions
              </button>
              <button 
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-colors ${activeTab === 'email' ? 'border-[#5D22D7] text-[#5D22D7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Mail className="w-4 h-4" />
                Manual Email Review
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 font-medium flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
              Loading queue...
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm">
              No pending verifications in this lane. You're all caught up!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map(item => (
                <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-64 h-40 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="Proof" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">No Image Provided</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{item.user?.profile?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-500 font-medium">{item.user?.email}</p>
                      <div className="mt-4 flex gap-3">
                        <div className="bg-[#F0EBFD] px-4 py-2 rounded-xl border border-[#5D22D7]/10">
                          <p className="text-[10px] text-[#5D22D7] font-bold mb-0.5 uppercase tracking-wider">College</p>
                          <p className="font-bold text-gray-900 text-sm">{item.user?.profile?.college?.name || 'N/A'}</p>
                        </div>
                        {activeTab === 'id_card' && (
                           <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                             <p className="text-[10px] text-amber-600 font-bold mb-0.5 uppercase tracking-wider">OTP Status</p>
                             <p className="font-bold text-amber-900 text-sm">Pending Integration</p>
                           </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => handleAction(item._id, 'approve')}
                        className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleAction(item._id, 'reject')}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
  );
}
