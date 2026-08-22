import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxLength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'photo', 'poll', 'event'], default: 'text' },
  content: { type: String, maxLength: 2000, required: function() { return this.type === 'text'; } },
  imageUrl: { type: String, default: null },
  pollData: {
    question: { type: String },
    allowMultipleSelection: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    options: [{
      text: { type: String, required: true },
      displayOrder: { type: Number, required: true }
    }]
  },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  removed_by_admin: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema]
}, {
  timestamps: true
});

PostSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await mongoose.model('PollVote').deleteMany({ postId: doc._id });
  }
  next();
});

PostSchema.pre('deleteMany', async function(next) {
  // If deleteMany is called, this might be tricky, but we can do our best or leave it.
  next();
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
