"use client";

import { useState, useEffect } from 'react';
import { Award, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/mentors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMentors(data);
        } else {
          setMentors([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const startChat = async (mentorUserId) => {
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: mentorUserId, type: 'ambassador' })
      });
      if (res.ok) {
        const thread = await res.json();
        router.push(`/messages/${thread._id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Could not start conversation');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-2xl p-6 shadow-sm text-white">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-8 h-8 text-white/90" />
          <h1 className="text-2xl font-bold">Campus Ambassadors</h1>
        </div>
        <p className="opacity-90 max-w-2xl">
          Connect with official student ambassadors to learn more about campus life, academics, and culture.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">Loading mentors...</div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-10 text-muted bg-surface rounded-2xl border border-border-light">
          No ambassadors available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map(mentor => (
            <div key={mentor._id} className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-accent-soft mb-3 border-2 border-primary">
                {mentor.user?.profile?.photo && (
                  <img src={mentor.user.profile.photo} alt={mentor.user.profile.name} className="w-full h-full rounded-full object-cover" />
                )}
              </div>
              <h3 className="font-bold text-lg text-text-main">{mentor.user?.profile?.name}</h3>
              <p className="text-sm text-primary font-medium mb-1">{mentor.department}</p>
              <div className="flex items-center gap-1 text-xs text-muted mb-4">
                <span>⭐ {mentor.rating} Rating</span>
                <span>•</span>
                <span>{mentor.responseRate}% Response</span>
              </div>
              
              <button 
                onClick={() => startChat(mentor.user._id)}
                className="w-full mt-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
