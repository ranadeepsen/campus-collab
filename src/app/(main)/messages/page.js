"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesList() {
  const { user } = useUser();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chat/threads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setThreads(data);
        } else {
          setThreads([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border-light overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-4 border-b border-border-light">
        <h2 className="font-bold text-xl text-text-main">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-10 text-center text-muted">Loading messages...</div>
        ) : threads.length === 0 ? (
          <div className="p-10 text-center text-muted flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-border-light mb-4" />
            <p>No active conversations.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {threads.map(thread => {
              const otherUser = thread.participants.find(
                (participant) => participant.clerkId !== user?.id
              );
              return (
                <Link key={thread._id} href={`/messages/${thread._id}`} className="block hover:bg-accent-soft/50 transition-colors p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-soft shrink-0 relative">
                      {otherUser?.profile?.photo && (
                        <img src={otherUser.profile.photo} alt={otherUser.profile.name} className="w-full h-full rounded-full object-cover" />
                      )}
                      {thread.status === 'active' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-text-main truncate text-sm">
                          {otherUser?.profile?.name || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-muted">
                          {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted truncate">
                        {thread.status === 'pending' ? 'Pending connection request...' : 'Click to view messages'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
