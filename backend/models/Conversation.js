// models/Conversation.js (NEW FILE)
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedFile',
    default: null
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Question cannot exceed 1000 characters']
  },
  answer: {
    type: String,
    required: true
  },
  aiModel: {
    type: String,
    default: 'gemini-2.0-flash'
  },
  voiceGenerated: {
    type: Boolean,
    default: false
  },
  voiceFile: {
    filename: String,
    duration: Number,
    size: Number,
    provider: String
  },
  metadata: {
    responseTime: Date,
    quality: String,
    personalized: Boolean,
    subject: String,
    tokensUsed: Number
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, subject: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
