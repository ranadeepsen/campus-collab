import { useState, useEffect } from 'react';
import { ShieldCheck, User, Check, X, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';

export default function ClubAdminPanel({ club, onUpdate }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: club.name,
    description: club.description,
    category: club.category,
    joinMode: club.joinMode,
    logoUrl: club.logoUrl || '',
    coverImageUrl: club.coverImageUrl || ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${club._id}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setPending(data.pending || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [club._id]);

  const handleAction = async (userId, action) => {
    if (actionLoading) return;
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    setActionLoading(true);
    try {
      let res;
      if (action === 'remove') {
        res = await fetch(`/api/clubs/${club._id}/members/${userId}`, { method: 'DELETE' });
      } else {
        res = await fetch(`/api/clubs/${club._id}/members/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (actionLoading) return;
    
    if (editForm.name !== club.name) {
      if (!confirm("Warning: Changing the club name will require platform re-approval and temporarily hide your club. Continue?")) return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/clubs/${club._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert("Settings updated!");
      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading admin data...</div>;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row min-h-[500px]">
      
      {/* Sidebar navigation */}
      <div className="w-full sm:w-48 sm:border-r border-b sm:border-b-0 border-gray-100 p-4 shrink-0 flex sm:flex-col gap-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-bold rounded-xl text-left whitespace-nowrap transition-colors flex justify-between items-center ${activeTab === 'requests' ? 'bg-purple-50 text-[#5D22D7]' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Join Requests
          {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pending.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-sm font-bold rounded-xl text-left whitespace-nowrap transition-colors ${activeTab === 'members' ? 'bg-purple-50 text-[#5D22D7]' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Manage Members
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-bold rounded-xl text-left whitespace-nowrap transition-colors ${activeTab === 'settings' ? 'bg-purple-50 text-[#5D22D7]' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Club Settings
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6">
        {activeTab === 'requests' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Requests</h3>
            {pending.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending requests.</p>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {pending.map(m => (
                  <div key={m._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {m.user?.profile?.avatar ? (
                        <img src={m.user.profile.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{m.user?.profile?.name || `${m.user?.firstName} ${m.user?.lastName}`}</p>
                        <p className="text-xs text-gray-500">Requested {new Date(m.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(m.user._id, 'reject')} disabled={actionLoading} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleAction(m.user._id, 'approve')} disabled={actionLoading} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Members</h3>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              {members.map(m => (
                <div key={m._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {m.user?.profile?.avatar ? (
                      <img src={m.user.profile.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        {m.user?.profile?.name || `${m.user?.firstName} ${m.user?.lastName}`}
                        {m.role === 'admin' && <ShieldCheck className="w-4 h-4 text-[#5D22D7]" />}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{m.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {m.role === 'member' && (
                      <button onClick={() => handleAction(m.user._id, 'promote')} disabled={actionLoading} className="px-3 py-1.5 text-xs font-bold bg-purple-50 text-[#5D22D7] hover:bg-purple-100 rounded-lg transition-colors">
                        Make Admin
                      </button>
                    )}
                    {m.role === 'admin' && (
                      <button onClick={() => handleAction(m.user._id, 'demote')} disabled={actionLoading} className="px-3 py-1.5 text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        Demote
                      </button>
                    )}
                    <button onClick={() => handleAction(m.user._id, 'remove')} disabled={actionLoading} className="px-3 py-1.5 text-xs font-bold border border-red-100 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Club Settings</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 max-w-lg">
              
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-2 items-start text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Changing the club name will reset your status to <strong>Pending Review</strong>.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Club Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7]"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] bg-white"
                  value={editForm.category}
                  onChange={e => setEditForm({...editForm, category: e.target.value})}
                >
                  <option value="Tech">Tech</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                  <option value="Career">Career</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Join Mode</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] bg-white"
                  value={editForm.joinMode}
                  onChange={e => setEditForm({...editForm, joinMode: e.target.value})}
                >
                  <option value="open">Open to All</option>
                  <option value="request">Request to Join</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] resize-none"
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Club Logo</label>
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
                    onSuccess={(res) => setEditForm({...editForm, logoUrl: res.info.secure_url})}
                  >
                    {({ open }) => (
                      <div 
                        onClick={() => open()} 
                        className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#5D22D7] cursor-pointer transition-all h-32"
                      >
                        {editForm.logoUrl ? (
                          <img src={editForm.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-2xl shadow-sm mb-2" />
                        ) : (
                          <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                        )}
                        <span className="text-xs font-semibold">{editForm.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                      </div>
                    )}
                  </CldUploadWidget>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Cover Wallpaper</label>
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'campus_collab_posts'}
                    onSuccess={(res) => setEditForm({...editForm, coverImageUrl: res.info.secure_url})}
                  >
                    {({ open }) => (
                      <div 
                        onClick={() => open()} 
                        className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#5D22D7] cursor-pointer transition-all h-32 relative overflow-hidden"
                      >
                        {editForm.coverImageUrl ? (
                          <>
                            <img src={editForm.coverImageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            <div className="relative z-10 bg-white/80 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm">Change Cover</div>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                            <span className="text-xs font-semibold">Upload Wallpaper</span>
                          </>
                        )}
                      </div>
                    )}
                  </CldUploadWidget>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#5D22D7] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#4C1D95] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
