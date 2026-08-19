import mongoose from 'mongoose';

const ChatThreadSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'active', 'closed'], default: 'active' },
  threadType: { type: String, enum: ['ambassador', 'direct'], required: true },
  connectedAt: { type: Date, default: null },
  feedbackDueAt: { type: Date, default: null },
  feedbackSent: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.ChatThread || mongoose.model('ChatThread', ChatThreadSchema);
