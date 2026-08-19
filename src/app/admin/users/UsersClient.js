"use client";

import { useState, useEffect } from 'react';
import { Users as UsersIcon, Loader2, ArrowLeft, Search, Ban, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function UsersClient({ adminId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId, action, reason) => {
    if (!reason && action !== 'reset_status') {
      const promptReason = prompt("Please provide a reason for this action:");
      if (!promptReason) return;
      reason = promptReason;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });

      if (res.ok) {
        fetchUsers();
      } else {
        alert("Failed to perform action.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.college?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'verified') return matchesSearch && user.status === 'verified';
    if (filter === 'pending') return matchesSearch && user.status === 'pending_review';
    if (filter === 'suspended') return matchesSearch && (user.status === 'suspended' || user.isBanned);
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-[#5D22D7]" />
                User Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">Search, moderate, and manage user accounts.</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or college..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-200">
            {['all', 'verified', 'pending', 'suspended'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-[#5D22D7] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
            Loading users...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-4">User</th>
                    <th className="p-4">College</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            {user.profile?.photo ? <img src={user.profile.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#5D22D7] text-white flex items-center justify-center font-bold">{user.profile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()}</div>}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{user.profile?.name || 'Incomplete Profile'} {user.isAmbassador && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-md ml-1">Ambassador</span>}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-700">{user.profile?.college?.name || '-'}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full 
                          ${user.isBanned ? 'bg-red-50 text-red-700 border border-red-200' : 
                            user.status === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' : 
                            user.status === 'pending_review' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                            user.status === 'suspended' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                            'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                          {user.isBanned ? 'Banned' : user.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.status !== 'verified' && !user.isBanned && (
                            <button onClick={() => handleAction(user._id, 'force_verify')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Force Verify">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {user.status === 'pending_review' && (
                            <button onClick={() => handleAction(user._id, 'reset_status')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Reset Stuck Status">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          {user.status !== 'suspended' && !user.isBanned ? (
                            <button onClick={() => handleAction(user._id, 'suspend')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Suspend">
                              <XCircle className="w-4 h-4" />
                            </button>
                          ) : !user.isBanned ? (
                            <button onClick={() => handleAction(user._id, 'unsuspend')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Unsuspend">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : null}
                          {!user.isBanned ? (
                            <button onClick={() => { if(confirm("Are you sure you want to ban this user?")) handleAction(user._id, 'ban') }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Ban Account">
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleAction(user._id, 'unban')} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold px-2" title="Unban Account">
                              UNBAN
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No users found matching your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
