"use client";

import { useState, useEffect } from 'react';
import ClubCard from '@/components/shared/ClubCard';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clubs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClubs(data);
        } else {
          setClubs([]);
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
        <h1 className="text-2xl font-bold text-text-main mb-2">Campus Clubs</h1>
        <p className="text-muted">Discover and join communities that match your interests.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">Loading clubs...</div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-10 text-muted bg-surface rounded-2xl border border-border-light">
          No clubs found on your campus yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map(club => <ClubCard key={club._id} club={club} />)}
        </div>
      )}
    </div>
  );
}
