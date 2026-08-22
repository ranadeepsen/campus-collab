import mongoose from 'mongoose';

const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ["Tech", "Cultural", "Sports", "Arts", "Career", "Other"] 
  },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  coverImageUrl: { type: String, default: null },
  logoUrl: { type: String, default: null },
  status: { 
    type: String, 
    required: true, 
    enum: ["pending_review", "approved", "rejected"],
    default: "pending_review"
  },
  joinMode: { 
    type: String, 
    required: true, 
    enum: ["open", "request"],
    default: "request"
  },
  proofText: { type: String, required: true },
  proofFileUrl: { type: String, default: null },
  trending: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  is_featured: { type: Boolean, default: false },
  featured_until: { type: Date, default: null },
  removed_by_admin: { type: Boolean, default: false }
}, {
  timestamps: true
});

delete mongoose.models.Club;
export default mongoose.models.Club || mongoose.model('Club', ClubSchema);
