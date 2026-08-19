import mongoose from 'mongoose';

const PointsTransactionSchema = new mongoose.Schema({
  ambassador: { type: mongoose.Schema.Types.ObjectId, ref: 'AmbassadorProfile', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, enum: ['connection', 'feedback', 'manual_adjustment'], required: true },
  reasonDescription: { type: String, default: null },
  relatedThread: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread' },
  created_by: { type: String, default: 'system' } // Can be system or admin_id
}, {
  timestamps: true
});

export default mongoose.models.PointsTransaction || mongoose.model('PointsTransaction', PointsTransactionSchema);
