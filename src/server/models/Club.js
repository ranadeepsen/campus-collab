import mongoose from 'mongoose';

const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  department: { type: String, default: null },
  description: { type: String, required: true },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  trending: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  is_featured: { type: Boolean, default: false },
  featured_until: { type: Date, default: null },
  removed_by_admin: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.Club || mongoose.model('Club', ClubSchema);
