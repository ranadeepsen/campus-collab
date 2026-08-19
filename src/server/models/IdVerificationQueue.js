import mongoose from 'mongoose';

const IdVerificationQueueSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: String, default: null }, // Admin email or ID
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null }
}, {
  timestamps: true
});

export default mongoose.models.IdVerificationQueue || mongoose.model('IdVerificationQueue', IdVerificationQueueSchema);
