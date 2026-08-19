"use client";

import { useState, useEffect } from 'react';
import { Users, Search, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HubPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          console.error("API Error:", data.error);
          setStudents([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const startDirectChat = async (studentUserId) => {
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: studentUserId, type: 'direct' })
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
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main mb-1">Campus Hub</h1>
          <p className="text-muted">Discover and connect with other students.</p>
        </div>
        <div className="w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full sm:w-64 bg-background border border-border-light rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-10 text-muted bg-surface rounded-2xl border border-border-light">
          No other students found right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <div key={student._id} className="bg-surface rounded-2xl p-4 shadow-sm border border-border-light flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent-soft shrink-0">
                {student.profile?.photo && (
                  <img src={student.profile.photo} alt={student.profile.name} className="w-full h-full rounded-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-main truncate text-sm">{student.profile?.name}</h3>
                <p className="text-xs text-muted truncate">{student.profile?.department || 'Student'}</p>
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => startDirectChat(student._id)}
                    className="flex-1 bg-accent-soft hover:bg-primary/20 text-primary py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" /> Connect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
