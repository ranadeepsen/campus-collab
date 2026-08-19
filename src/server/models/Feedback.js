import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  note: { type: String, default: '' },
  pointsAwarded: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
