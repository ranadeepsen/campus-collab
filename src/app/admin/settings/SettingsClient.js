"use client";

import { useState, useEffect } from 'react';
import { Settings, Shield, Plus, Loader2, ArrowLeft, Trash2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SettingsClient({ currentAdminId }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('moderator');
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, role: newRole })
      });

      if (res.ok) {
        setNewEmail('');
        fetchAdmins();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add admin.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Are you sure you want to remove this admin? They will lose access immediately.")) return;

    try {
      const res = await fetch(`/api/admin/settings?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setAdmins(admins.filter(a => a._id !== id));
      } else {
        alert("Failed to remove admin.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#5D22D7]" />
                Admin Roles & Settings
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage team access and permissions.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#5D22D7]" />
                Add New Admin
              </h2>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all" 
                    placeholder="colleague@college.edu" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                  <select 
                    value={newRole} 
                    onChange={e => setNewRole(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all bg-white"
                  >
                    <option value="moderator">Moderator (Queue, Users, Reports)</option>
                    <option value="super-admin">Super Admin (Full Access)</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={adding} 
                  className="w-full bg-[#5D22D7] hover:bg-[#4C1D95] text-white font-bold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Admin
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">Active Admins</h3>
              </div>
              
              {loading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {admins.map(admin => (
                    <li key={admin._id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#5D22D7]/10 flex items-center justify-center text-[#5D22D7] font-bold text-lg">
                          {admin.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{admin.email} {admin._id === currentAdminId && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <span className={`inline-block w-2 h-2 rounded-full ${admin.role === 'super-admin' ? 'bg-[#5D22D7]' : 'bg-gray-400'}`}></span>
                            {admin.role === 'super-admin' ? 'Super Admin' : 'Moderator'}
                          </p>
                        </div>
                      </div>
                      
                      {admin._id !== currentAdminId && (
                        <button 
                          onClick={() => handleRemove(admin._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Access"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
