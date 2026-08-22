"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Link as LinkIcon, Calendar, Clock, ArrowRight, Trash2, X, AlignLeft, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useUser } from '@clerk/nextjs';

export default function EventCard({ event, onEventDeleted }) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    // Auto-open modal if this event's ID is in the URL
    const eventId = searchParams ? searchParams.get('eventId') : null;
    if (eventId === event._id) {
      // eslint-disable-next-line
      setIsModalOpen(true);
    }
  }, [searchParams, event._id]);

  const dateObj = new Date(event.dateTime);
  const coverUrl = event.coverImageUrl ? (event.coverImageUrl.includes('res.cloudinary.com') ? event.coverImageUrl.replace('/upload/', '/upload/c_limit,w_800,f_auto,q_auto/') : event.coverImageUrl) : null;
  
  const canDelete = user && event.createdBy?.clerkId && user.id === event.createdBy.clerkId;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: 'DELETE'
      });
      if (res.ok && onEventDeleted) {
        onEventDeleted(event._id);
        setIsModalOpen(false);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete event');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting event');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] group flex flex-col h-full cursor-pointer relative"
      >
        {/* Delete Button (Absolute) */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full shadow-sm backdrop-blur-sm transition-colors"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Cover Image */}
        {coverUrl ? (
          <div className="w-full h-40 overflow-hidden bg-gray-100 relative shrink-0">
            <img 
              src={coverUrl} 
              alt={event.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                {event.category}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-sm ${
                event.mode === 'online' ? 'bg-green-100/90 text-green-700' : 'bg-blue-100/90 text-blue-700'
              }`}>
                {event.mode === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-2 bg-gradient-to-r from-[#5D22D7] to-[#7B2CBF] shrink-0" />
        )}

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          
          {/* Badges (if no image) */}
          {!event.coverImageUrl && (
            <div className="flex gap-2 mb-3 pr-10">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                {event.category}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                event.mode === 'online' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
              }`}>
                {event.mode === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-[17px] leading-tight mb-2 line-clamp-2 group-hover:text-[#5D22D7] transition-colors">
            {event.name}
          </h3>
          
          {/* Organizer */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100">
              {event.createdBy?.profile?.photo ? (
                <img src={event.createdBy.profile.photo} alt="Organizer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#5D22D7]/10" />
              )}
            </div>
            <span className="text-xs text-gray-600 font-medium truncate">
              {event.createdBy?.profile?.name || 'Student'} • {event.college?.name}
            </span>
          </div>

          {/* Details List */}
          <div className="space-y-2 mb-5">
            <div className="flex items-start gap-2.5 text-gray-600 text-[13px]">
              <Calendar className="w-4 h-4 text-[#5D22D7] shrink-0 mt-0.5" />
              <span>{format(dateObj, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-start gap-2.5 text-gray-600 text-[13px]">
              <Clock className="w-4 h-4 text-[#5D22D7] shrink-0 mt-0.5" />
              <span>{format(dateObj, 'h:mm a')}</span>
            </div>
            <div className="flex items-start gap-2.5 text-gray-600 text-[13px]">
              {event.mode === 'online' ? (
                <LinkIcon className="w-4 h-4 text-[#5D22D7] shrink-0 mt-0.5" />
              ) : (
                <MapPin className="w-4 h-4 text-[#5D22D7] shrink-0 mt-0.5" />
              )}
              <span className="line-clamp-2">
                {event.mode === 'online' ? (
                  <span className="text-[#5D22D7] font-medium break-all">Online Event</span>
                ) : (
                  event.venue || 'TBA'
                )}
              </span>
            </div>
          </div>

          {/* Contact Info (Hidden in card view if long, or just abbreviated) 
              Actually, since user clicks to see details, we can keep it here but truncate, 
              or just let it be. Let's keep it as is. */}
          {event.contactInfo && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Organizer</h4>
              <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-2">
                {event.contactInfo}
              </p>
            </div>
          )}

          {/* Spacer to push button down if in a grid */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            {event.registrationLink ? (
              <a 
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#5D22D7]/5 hover:bg-[#5D22D7]/10 text-[#5D22D7] font-bold text-sm py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
              >
                Register Now
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            ) : (
              <div className="w-full bg-gray-50 text-gray-500 font-bold text-sm py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                Open Event
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header / Cover */}
            <div className="relative bg-gray-900 flex items-center justify-center shrink-0">
              {coverUrl ? (
                <div className="w-full max-h-[40vh] bg-black flex items-center justify-center">
                  <img src={coverUrl} alt={event.name} className="max-w-full max-h-[40vh] object-contain" />
                </div>
              ) : (
                <div className="w-full h-20 bg-gradient-to-r from-[#5D22D7] to-[#7B2CBF]" />
              )}
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${event.coverImageUrl ? 'bg-black/60 hover:bg-black/80 text-white' : 'bg-white/20 hover:bg-white/40 text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-2 mb-3">
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide">
                  {event.category}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${
                  event.mode === 'online' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {event.mode === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.name}</h2>

              {/* Organizer */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {event.createdBy?.profile?.photo ? (
                    <img src={event.createdBy.profile.photo} alt="Organizer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#5D22D7]/10" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{event.createdBy?.profile?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{event.college?.name}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#5D22D7]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                    <p className="text-sm font-medium text-gray-900">{format(dateObj, 'MMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#5D22D7]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Time</p>
                    <p className="text-sm font-medium text-gray-900">{format(dateObj, 'h:mm a')}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    {event.mode === 'online' ? <LinkIcon className="w-5 h-5 text-[#5D22D7]" /> : <MapPin className="w-5 h-5 text-[#5D22D7]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      {event.mode === 'online' ? 'Meeting Link' : 'Venue'}
                    </p>
                    {event.mode === 'online' ? (
                      <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#5D22D7] hover:underline break-all">
                        {event.meetingLink}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-900 leading-snug">{event.venue || 'TBA'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlignLeft className="w-4 h-4 text-gray-400" />
                  <h3 className="font-bold text-sm text-gray-900">About Event</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Contact Info */}
              {event.contactInfo && (
                <div className="mb-6 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-sm text-gray-900">Contact Organizer</h3>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {event.contactInfo}
                  </p>
                </div>
              )}

            </div>

            {/* Footer / CTA */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {event.registrationLink ? (
                <a 
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#5D22D7] hover:bg-[#4C1D95] text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Register Now
                  <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <div className="flex-1 bg-white border border-gray-200 text-gray-500 font-bold text-sm py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                  Open Event - No Registration Required
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
