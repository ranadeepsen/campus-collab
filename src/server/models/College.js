import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email_domains: [{ type: String }],
  departments: [{ type: String }],
  logo: { type: String, default: null },
  is_active: { type: Boolean, default: true },
  verified: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.College || mongoose.model('College', CollegeSchema);
