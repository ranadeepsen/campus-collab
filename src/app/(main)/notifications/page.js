"use client";

import { useState, useEffect } from 'react';
import { Bell, UserPlus, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          
          // Mark all as read after fetching
          const unreadIds = data.filter(n => !n.read).map(n => n._id);
          if (unreadIds.length > 0) {
            fetch('/api/notifications', { method: 'PATCH' });
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'connection_request':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'connection_accepted':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main mb-1">Notifications</h1>
          <p className="text-muted">Stay updated with your campus community.</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6" />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-surface rounded-2xl p-10 shadow-sm border border-border-light text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted">You have no new notifications.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border-light shadow-sm overflow-hidden divide-y divide-gray-100">
          {notifications.map(notification => (
            <Link key={notification._id} href={notification.link || '#'} className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}>
              <div className="shrink-0 mt-1">
                {notification.relatedUser?.profile?.photo ? (
                  <div className="relative">
                    <img src={notification.relatedUser.profile.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      {getIcon(notification.type)}
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {!notification.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-3"></div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
