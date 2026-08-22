import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  dateTime: { type: Date, required: true },
  mode: { type: String, enum: ['online', 'offline'], required: true },
  venue: { type: String },
  meetingLink: { type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  category: { 
    type: String, 
    enum: ['Tech', 'Cultural', 'Sports', 'Career', 'Workshop', 'Other'], 
    required: true 
  },
  coverImageUrl: { type: String, default: null },
  registrationLink: { type: String, default: null },
  contactInfo: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

delete mongoose.models.Event;
export default mongoose.model('Event', EventSchema);
