"use client";

import { useState, useEffect, useRef, use } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function ChatWindow({ params }) {
  const { id } = use(params);
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`/api/chat/threads/${id}/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSending(true);
    try {
      const res = await fetch(`/api/chat/threads/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (res.ok) {
        const newMessage = await res.json();
        setMessages([...messages, newMessage]);
        setContent('');
      } else {
        alert("Failed to send message (Thread might be inactive).");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border-light flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 border-b border-border-light flex items-center gap-3">
        <Link href="/messages" className="p-2 hover:bg-accent-soft rounded-lg md:hidden">
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <h2 className="font-bold text-lg text-text-main">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-muted">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted h-full flex items-center justify-center">
            No messages yet. Say hi!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?.clerkId === user?.id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-accent-soft text-text-main rounded-bl-none'}`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border-light">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background border border-border-light rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full disabled:opacity-50 hover:bg-primary-dark transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
