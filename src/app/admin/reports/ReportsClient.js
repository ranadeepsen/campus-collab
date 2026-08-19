"use client";

import { useState, useEffect } from 'react';
import { Flag, Loader2, ArrowLeft, Trash2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReportsClient() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId, action) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        setReports(reports.filter(r => r._id !== reportId));
      } else {
        alert("Failed to perform action.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Flag className="w-6 h-6 text-[#5D22D7]" />
                Reported Content
              </h1>
              <p className="text-gray-500 text-sm mt-1">Review and moderate content reported by users.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm">
            No pending reports. Great job!
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report._id} className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                      {report.content_type}
                    </span>
                    <p className="text-gray-900 font-medium text-sm">
                      <span className="text-gray-500">Reported by:</span> {report.reporter_id?.profile?.name || report.reporter_id?.email || 'Unknown User'}
                    </p>
                    <p className="text-gray-900 font-medium text-sm mt-1">
                      <span className="text-gray-500">Reason:</span> {report.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">ID: {report.content_id}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                  <button onClick={() => handleAction(report._id, 'dismiss')} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-gray-200">
                    <XCircle className="w-4 h-4" /> Dismiss Report
                  </button>
                  <button onClick={() => { if(confirm("Remove this content permanently?")) handleAction(report._id, 'remove_content') }} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                    <Trash2 className="w-4 h-4" /> Remove Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
