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
  const [connectionData, setConnectionData] = useState(null);
  
  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch messages
    fetch(`/api/chat/threads/${id}/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
        else setMessages([]);
        setLoading(false);
      })
      .catch(console.error);
      
    // Fetch connection status for feedback
    fetch(`/api/chat/threads/${id}/ambassador-connection`)
      .then(res => res.json())
      .then(data => {
        if (data && data.connection) {
          setConnectionData(data);
        }
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, connectionData]);

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

  const submitFeedback = async () => {
    if (feedbackRating === 0) return alert("Please select a rating.");
    setFeedbackSubmitting(true);
    try {
      const res = await fetch(`/api/ambassador-connections/${connectionData.connection._id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: feedbackRating, feedbackText })
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        setTimeout(() => setConnectionData(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Determine if we should show feedback prompt
  let showFeedback = false;
  if (connectionData?.isProspect && connectionData?.connection && !connectionData.connection.feedbackSubmittedAt && !feedbackSuccess) {
    const acceptedAt = new Date(connectionData.connection.acceptedAt);
    const now = new Date();
    const hoursSinceAccept = (now - acceptedAt) / (1000 * 60 * 60);
    if (hoursSinceAccept >= 24) {
      showFeedback = true;
    }
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border-light flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 border-b border-border-light flex items-center gap-3">
        <Link href="/messages" className="p-2 hover:bg-accent-soft rounded-lg md:hidden">
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <h2 className="font-bold text-lg text-text-main">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showFeedback && (
          <div className="bg-[#5D22D7]/5 border border-[#5D22D7]/20 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-[#5D22D7] mb-1">Rate your experience!</h3>
            <p className="text-sm text-gray-600 mb-3">How helpful was {connectionData.connection.ambassadorId?.profile?.name || 'this ambassador'}?</p>
            
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setFeedbackRating(star)}
                  className={`text-2xl transition-transform ${feedbackRating >= star ? 'text-amber-400 scale-110' : 'text-gray-300 hover:scale-110'}`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <input 
              type="text" 
              placeholder="Any additional feedback? (Optional)"
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              className="w-full text-sm p-2 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:border-[#5D22D7]"
            />
            
            <button 
              onClick={submitFeedback}
              disabled={feedbackRating === 0 || feedbackSubmitting}
              className="bg-[#5D22D7] text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        )}

        {feedbackSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-center font-bold text-sm mb-4">
            Thanks for your feedback! It helps improve the community.
          </div>
        )}

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
