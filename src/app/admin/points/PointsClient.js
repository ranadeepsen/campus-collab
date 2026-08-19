"use client";

import { useState, useEffect } from 'react';
import { Award, Loader2, ArrowLeft, Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function PointsClient() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ambassadors, setAmbassadors] = useState([]);
  const [formData, setFormData] = useState({ ambassadorId: '', amount: '', reasonDescription: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/points');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setAmbassadors(data.ambassadors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/admin/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambassadorId: formData.ambassadorId,
          amount: Number(formData.amount),
          reasonDescription: formData.reasonDescription
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ ambassadorId: '', amount: '', reasonDescription: '' });
        fetchData();
      } else {
        alert("Failed to add transaction.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.ambassador?.user?.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ambassador?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-[#5D22D7]" />
                Points Ledger
              </h1>
              <p className="text-gray-500 text-sm mt-1">Audit and adjust ambassador points manually.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5D22D7] hover:bg-[#4C1D95] text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" /> Manual Adjustment
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions by ambassador name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all bg-white shadow-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#5D22D7]" />
            Loading ledger...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-4">Date</th>
                    <th className="p-4">Ambassador</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Details / Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map(t => (
                    <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm text-gray-500 font-medium">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{t.ambassador?.user?.profile?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{t.ambassador?.user?.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${t.amount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {t.amount > 0 ? '+' : ''}{t.amount}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                          {t.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {t.reasonDescription && <div className="italic">"{t.reasonDescription}"</div>}
                        <div className="text-xs text-gray-400 mt-1">by: {t.created_by}</div>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Manual Adjustment</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ambassador</label>
                  <select 
                    required 
                    value={formData.ambassadorId} 
                    onChange={e => setFormData({...formData, ambassadorId: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all bg-white"
                  >
                    <option value="" disabled>Select an ambassador...</option>
                    {ambassadors.map(a => (
                      <option key={a._id} value={a._id}>{a.user?.profile?.name || a.user?.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Amount</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all" 
                    placeholder="e.g. 50 or -20" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Use negative values to deduct points.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Reason (Required)</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.reasonDescription} 
                    onChange={e => setFormData({...formData, reasonDescription: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5D22D7] focus:ring-2 focus:ring-[#5D22D7]/20 outline-none transition-all" 
                    placeholder="e.g. Winner of the weekly challenge" 
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="bg-[#5D22D7] hover:bg-[#4C1D95] text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Adjustment'}
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
