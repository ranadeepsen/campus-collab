import mongoose from 'mongoose';

const AmbassadorConnectionSchema = new mongoose.Schema({
  ambassadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prospectiveStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['requested', 'accepted', 'declined'], default: 'requested' },
  acceptedAt: { type: Date, default: null },
  basePointsAwarded: { type: Boolean, default: false },
  feedbackRequestedAt: { type: Date, default: null },
  feedbackSubmittedAt: { type: Date, default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
  feedbackText: { type: String, default: null },
  bonusPointsAwarded: { type: Number, default: 0 },
  firstProspectMessageAt: { type: Date, default: null },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread' } // link to the actual chat thread
}, {
  timestamps: true
});

delete mongoose.models.AmbassadorConnection;
export default mongoose.models.AmbassadorConnection || mongoose.model('AmbassadorConnection', AmbassadorConnectionSchema);
