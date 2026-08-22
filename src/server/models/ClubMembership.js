import mongoose from 'mongoose';

const ClubMembershipSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ["admin", "member", "pending"],
    default: "pending"
  },
  joinedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Ensure a user can only have one membership row per club
ClubMembershipSchema.index({ club: 1, user: 1 }, { unique: true });

delete mongoose.models.ClubMembership;
export default mongoose.models.ClubMembership || mongoose.model('ClubMembership', ClubMembershipSchema);