import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  description: { type: String, required: true },
  dateTime: { type: Date, required: true },
  is_featured: { type: Boolean, default: false },
  featured_until: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rsvpIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  visibility: { type: String, enum: ['public', 'college_only', 'department_only', 'club_only'], default: 'college_only' },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', default: null },
  removed_by_admin: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
