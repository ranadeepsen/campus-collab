import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  clerkId: { type: String, default: null }, // Optional, linking to Clerk if they login via Clerk
  role: { type: String, enum: ['super-admin', 'moderator'], default: 'moderator' },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }
}, {
  timestamps: true
});

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
