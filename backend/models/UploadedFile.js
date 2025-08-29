// models/UploadedFile.js (NEW FILE)
import mongoose from 'mongoose';

const uploadedFileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  processedData: {
    pages: Number,
    wordCount: Number,
    textPreview: String,
    fullText: String,
    topics: [String],
    subject: String,
    difficulty: String
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'processing'
  },
  errorMessage: String,
  uploadedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for efficient queries
uploadedFileSchema.index({ userId: 1, uploadedAt: -1 });
uploadedFileSchema.index({ userId: 1, status: 1 });

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);
export default UploadedFile;
