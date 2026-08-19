import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxLength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'photo'], default: 'text' },
  content: { type: String, maxLength: 2000, required: function() { return this.type === 'text'; } },
  imageUrl: { type: String, default: null },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  removed_by_admin: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema]
}, {
  timestamps: true
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
