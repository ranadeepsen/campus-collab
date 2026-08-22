import { useState, useEffect } from 'react';
import { ShieldCheck, User } from 'lucide-react';

export default function ClubMembers({ clubId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/clubs/${clubId}/members`);
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [clubId]);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading members...</div>;

  if (members.length === 0) return <div className="text-center py-10 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">No members found.</div>;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-100">
        {members.map(m => (
          <div key={m._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              {m.user?.profile?.avatar ? (
                <img src={m.user.profile.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{m.user?.profile?.name || `${m.user?.firstName} ${m.user?.lastName}`}</p>
                <p className="text-xs text-gray-500 capitalize">{m.role}</p>
              </div>
            </div>
            
            {m.role === 'admin' && (
              <ShieldCheck className="w-5 h-5 text-[#5D22D7]" title="Club Admin" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
