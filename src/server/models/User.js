import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  user_type: { type: String, enum: ['current', 'prospective', null], default: null },
  status: { type: String, enum: ['unverified', 'pending_review', 'verified', 'rejected', 'suspended'], default: 'unverified' },
  verification_method: { type: String, enum: ['college_email', 'college_id_card', null], default: null },
  verification_document: { type: String, default: null },
  review_reason: { type: String, default: null },
  profileCompleted: { type: Boolean, default: false },
  isAmbassador: { type: Boolean, default: false },
  ambassadorStatus: { type: String, enum: ['none', 'active'], default: 'none' },
  ambassadorPoints: { type: Number, default: 0 },
  responseFlags: { type: Number, default: 0 },
  ambassadorHidden: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  
  profile: {
    name: { type: String, default: '' },
    photo: { type: String, default: '' },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
    course: { type: String, default: '' },
    department: { type: String, default: '' },
    yearOfStudy: { type: String, default: '' },
    bio: { type: String, default: '' },
    interests: [{ type: String }],
    socialLinks: {
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      github: { type: String, default: '' }
    }
  },
  
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
