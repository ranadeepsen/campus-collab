"use client";

import { useState, useEffect } from 'react';
import { Loader2, Check, X, ShieldAlert } from 'lucide-react';

export default function AdminClubsClient() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClubs = async () => {
    try {
      const res = await fetch('/api/admin/clubs', { cache: 'no-store' });
      if (res.ok) setClubs(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleAction = async (id, action) => {
    if (actionLoading) return;
    if (!confirm(`Are you sure you want to ${action} this club?`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/clubs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        alert(`Club successfully ${action}d!`);
        fetchClubs();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading pending clubs...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Club Review Queue</h1>
        <p className="text-gray-500">Review and approve new club registrations.</p>
      </div>

      {clubs.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center shadow-sm">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">All Caught Up!</h3>
          <p className="text-gray-500">There are no pending clubs to review right now.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {clubs.map(club => (
            <div key={club._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{club.name}</h2>
                    <p className="text-sm text-gray-500">College: <span className="font-semibold">{club.college?.name}</span></p>
                    <p className="text-sm text-gray-500">Category: <span className="font-semibold">{club.category}</span></p>
                    <p className="text-sm text-gray-500 mt-1">
                      Creator: {club.createdBy?.firstName} {club.createdBy?.lastName} 
                      <span className="text-xs ml-2 bg-gray-100 px-2 py-0.5 rounded">ID: {club.createdBy?.clerkId}</span>
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-gray-800">{club.description}</p>
                </div>
                
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Proof of Legitimacy</h4>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">{club.proofText}</p>
                  {club.proofFileUrl && (
                    <a href={club.proofFileUrl} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline text-sm mt-2 inline-block">
                      View Attached Proof File
                    </a>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center gap-3">
                <button
                  onClick={() => handleAction(club._id, 'approve')}
                  disabled={actionLoading}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Check className="w-5 h-5" /> Approve Club
                </button>
                <button
                  onClick={() => handleAction(club._id, 'reject')}
                  disabled={actionLoading}
                  className="w-full bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
