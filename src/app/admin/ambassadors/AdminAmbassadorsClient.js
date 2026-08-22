"use client";

import { useState, useEffect } from 'react';
import { Loader2, Check, X, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAmbassadorsClient() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/ambassador-applications');
      if (res.ok) setApplications(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (id, action) => {
    if (actionLoading) return;
    if (!confirm(`Are you sure you want to ${action} this application?`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/ambassador-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchApplications();
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

  if (loading) return <div className="p-10 text-center">Loading pending applications...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ambassador Review Queue</h1>
        <p className="text-gray-500">Review and approve new Campus Ambassador applications.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center shadow-sm">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">All Caught Up!</h3>
          <p className="text-gray-500">There are no pending ambassador applications to review right now.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map(app => (
            <div key={app._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{app.user?.profile?.name || app.user?.firstName || 'Unknown'}</h2>
                    <p className="text-sm text-gray-500">College: <span className="font-semibold">{app.user?.profile?.college?.name}</span></p>
                    <p className="text-sm text-gray-500">Department: <span className="font-semibold">{app.department}</span></p>
                    <p className="text-sm text-gray-500">Year of Study: <span className="font-semibold">{app.yearOfStudy}</span></p>
                    <p className="text-xs text-gray-400 mt-1">Applied: {format(new Date(app.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Reason for applying</h4>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl">{app.reason}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Topics</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {app.topics?.map(topic => (
                      <span key={topic} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                
                {app.availability && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Availability</h4>
                    <p className="text-sm text-gray-800">{app.availability}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center gap-3">
                <button
                  onClick={() => handleAction(app._id, 'approve')}
                  disabled={actionLoading}
                  className="w-full bg-[#5D22D7] text-white py-2.5 rounded-xl font-bold hover:bg-[#4C1D95] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction(app._id, 'reject')}
                  disabled={actionLoading}
                  className="w-full bg-white text-red-600 border border-red-200 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
