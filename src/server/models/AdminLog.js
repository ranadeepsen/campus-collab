import mongoose from 'mongoose';

const AdminLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  target_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['suspend', 'unsuspend', 'ban', 'force_verify', 'reset_status'], required: true },
  reason: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema);
