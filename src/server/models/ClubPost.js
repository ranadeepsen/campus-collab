import mongoose from 'mongoose';

const ClubPostSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

delete mongoose.models.ClubPost;
export default mongoose.models.ClubPost || mongoose.model('ClubPost', ClubPostSchema);