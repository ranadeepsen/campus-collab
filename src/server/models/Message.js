import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  readAt: { type: Date, default: null }
}, {
  timestamps: true // adds createdAt (sentAt) and updatedAt
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
