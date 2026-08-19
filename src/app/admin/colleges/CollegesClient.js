"use client";

import { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Loader2, ArrowLeft, Trash2, PowerOff, Power, X } from 'lucide-react';
import Link from 'next/link';

export default function CollegesClient() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [formData, setFormData] = useState({ name: '', email_domains: '', departments: '', logo: '' });
  const [saving, setSaving] = useState(false);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/colleges');
      if (res.ok) {
        const data = await res.json();
        setColleges(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const openAddModal = () => {
    setEditingCollege(null);
    setFormData({ name: '', email_domains: '', departments: '', logo: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (college) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      email_domains: (college.email_domains || []).join(', '),
      departments: (college.departments || []).join(', '),
      logo: college.logo || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      name: formData.name,
      email_domains: formData.email_domains.split(',').map(d => d.trim()).filter(Boolean),
      departments: formData.departments.split(',').map(d => d.trim()).filter(Boolean),
      logo: formData.logo
    };

    try {
      const url = editingCollege ? `/api/admin/colleges/${editingCollege._id}` : '/api/admin/colleges';
      const method = editingCollege ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchColleges();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) fetchColleges();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#5D22D7]" />
                College Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage active colleges and permitted email domains.</p>
            </div>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-[#5D22D7] hover:bg-[#4C1D95] text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" /> Add College
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
            Loading colleges...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-4">College</th>
                    <th className="p-4">Domains</th>
                    <th className="p-4 text-center">Students</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {colleges.map(college => (
                    <tr key={college._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {college.logo ? <img src={college.logo} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{college.name}</div>
                            <div className="text-xs text-gray-500">{(college.departments || []).length} departments</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(college.email_domains || []).map(d => (
                            <span key={d} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md border border-blue-100">{d}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center font-medium text-gray-600">
                        {college.studentCount || 0}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${college.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {college.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toggleActive(college._id, college.is_active)} className={`p-2 rounded-lg transition-colors ${college.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`} title={college.is_active ? "Deactivate" : "Activate"}>
                            {college.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEditModal(college)} className="p-2 text-gray-500 hover:text-[#5D22D7] hover:bg-[#5D22D7]/10 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {colleges.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No colleges found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">{editingCollege ? 'Edit College' : 'Add New College'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">College Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all" placeholder="e.g. Stanford University" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Valid Email Domains</label>
                  <input type="text" required value={formData.email_domains} onChange={e => setFormData({...formData, email_domains: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all" placeholder="e.g. stanford.edu, cs.stanford.edu (comma separated)" />
                  <p className="text-xs text-gray-500 mt-1">Students must use these domains to auto-verify.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Departments</label>
                  <textarea rows="2" value={formData.departments} onChange={e => setFormData({...formData, departments: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all resize-none" placeholder="e.g. Computer Science, Engineering, Business (comma separated)" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Logo URL (Optional)</label>
                  <input type="url" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all" placeholder="https://..." />
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="bg-[#5D22D7] hover:bg-[#4C1D95] text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingCollege ? 'Save Changes' : 'Add College'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
