import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  reporter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content_type: { type: String, enum: ['post', 'comment', 'club', 'event'], required: true },
  content_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Generic reference
  reason: { type: String, required: true },
  status: { type: String, enum: ['open', 'reviewed', 'actioned', 'dismissed'], default: 'open' },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  reviewed_at: { type: Date, default: null }
}, {
  timestamps: true
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
