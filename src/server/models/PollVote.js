import mongoose from 'mongoose';

const PollVoteSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  optionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Ensure a user can't vote for the exact same option twice
PollVoteSchema.index({ postId: 1, optionId: 1, user: 1 }, { unique: true });

export default mongoose.models.PollVote || mongoose.model('PollVote', PollVoteSchema);
