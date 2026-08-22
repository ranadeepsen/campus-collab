import mongoose from 'mongoose';

const AmbassadorApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  yearOfStudy: { type: String, required: true },
  department: { type: String, required: true },
  reason: { type: String, required: true },
  topics: [{ 
    type: String, 
    enum: ["Academics", "Hostel & Campus Life", "Placements", "Clubs & Societies", "Admissions Process", "Other"] 
  }],
  availability: { type: String },
  status: { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' },
  rejectedAt: { type: Date, default: null },
  cooldownUntil: { type: Date, default: null }
}, {
  timestamps: true
});

delete mongoose.models.AmbassadorApplication;
export default mongoose.models.AmbassadorApplication || mongoose.model('AmbassadorApplication', AmbassadorApplicationSchema);
