"use client";

import { useState, useEffect } from 'react';
import EventCard from '@/components/shared/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light">
        <h1 className="text-2xl font-bold text-text-main mb-2">Upcoming Events</h1>
        <p className="text-muted">See what&apos;s happening around campus this week.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 text-muted bg-surface rounded-2xl border border-border-light">
          No upcoming events.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => <EventCard key={event._id} event={event} />)}
        </div>
      )}
    </div>
  );
}
