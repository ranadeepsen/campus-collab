"use client";

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, MessageSquare, Check, X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConnectionsPage() {
  const [data, setData] = useState({ pendingIncoming: [], pendingOutgoing: [], accepted: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');
  const router = useRouter();

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConnections();
  }, []);

  const handleAction = async (connectionId, status) => {
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchConnections();
        if (status === 'accepted' && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-stats-updated'));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startDirectChat = async (targetUserId) => {
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, type: 'direct' })
      });
      if (res.ok) {
        const thread = await res.json();
        router.push(`/messages/${thread._id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Connections</h1>
          <p className="text-gray-500 text-sm">Manage your network and incoming requests.</p>
        </div>
        
        <div className="flex border-b border-gray-100 gap-6">
          <button 
            onClick={() => setActiveTab('incoming')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'incoming' ? 'text-[#5D22D7]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pending Requests
            {data.pendingIncoming.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{data.pendingIncoming.length}</span>
            )}
            {activeTab === 'incoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5D22D7] rounded-t-full"></div>}
          </button>
          
          <button 
            onClick={() => setActiveTab('connections')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'connections' ? 'text-[#5D22D7]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Connections
            {data.accepted.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">{data.accepted.length}</span>
            )}
            {activeTab === 'connections' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5D22D7] rounded-t-full"></div>}
          </button>

          <button 
            onClick={() => setActiveTab('outgoing')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'outgoing' ? 'text-[#5D22D7]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sent Requests
            {activeTab === 'outgoing' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5D22D7] rounded-t-full"></div>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading connections...</div>
      ) : (
        <div className="space-y-4">
          
          {/* INCOMING REQUESTS */}
          {activeTab === 'incoming' && (
            data.pendingIncoming.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No pending requests.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {data.pendingIncoming.map(conn => (
                  <div key={conn._id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        <img src={conn.requester.profile?.photo || "/default-avatar.png"} alt={conn.requester.profile?.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{conn.requester.profile?.name}</h3>
                        <p className="text-xs text-gray-500">{conn.requester.profile?.college?.name} • {conn.requester.profile?.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(conn._id, 'rejected')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Decline">
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleAction(conn._id, 'accepted')} className="px-4 py-2 bg-emerald-100 hover:bg-emerald-500 text-emerald-700 hover:text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5" title="Accept">
                        <Check className="w-4 h-4" /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* MY CONNECTIONS */}
          {activeTab === 'connections' && (
            data.accepted.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>You haven&apos;t connected with anyone yet.</p>
                <button onClick={() => router.push('/hub')} className="mt-4 text-[#5D22D7] font-semibold hover:underline">Explore Campus Hub</button>
              </div>
            ) : (
              <div className="grid gap-3">
                {data.accepted.map(conn => (
                  <div key={conn._id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        <img src={conn.otherPerson.profile?.photo || "/default-avatar.png"} alt={conn.otherPerson.profile?.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{conn.otherPerson.profile?.name}</h3>
                        <p className="text-xs text-gray-500">{conn.otherPerson.profile?.college?.name} • {conn.otherPerson.profile?.department}</p>
                      </div>
                    </div>
                    <button onClick={() => startDirectChat(conn.otherPerson._id)} className="px-4 py-2 bg-[#F0EBFD] hover:bg-[#5D22D7] text-[#5D22D7] hover:text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> Message
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* OUTGOING REQUESTS */}
          {activeTab === 'outgoing' && (
            data.pendingOutgoing.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm text-gray-500">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No pending sent requests.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {data.pendingOutgoing.map(conn => (
                  <div key={conn._id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0 opacity-70">
                        <img src={conn.recipient.profile?.photo || "/default-avatar.png"} alt={conn.recipient.profile?.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{conn.recipient.profile?.name}</h3>
                        <p className="text-xs text-gray-500">Pending response...</p>
                      </div>
                    </div>
                    <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Requested
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

        </div>
      )}
    </div>
  );
}
