import mongoose from 'mongoose';

const AmbassadorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  department: { type: String, required: true },
  responseRate: { type: Number, default: 100 }, // percentage
  rating: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  badges: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.models.AmbassadorProfile || mongoose.model('AmbassadorProfile', AmbassadorProfileSchema);
