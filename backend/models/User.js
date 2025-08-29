// models/User.js (NEW FILE)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  university: {
    type: String,
    default: 'Not specified',
    trim: true
  },
  course: {
    type: String,
    default: 'Not specified',
    trim: true
  },
  preferences: {
    voiceEnabled: { type: Boolean, default: true },
    preferredVoiceStyle: { type: String, default: 'conversational' },
    learningLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' }
  },
  stats: {
    totalQuestions: { type: Number, default: 0 },
    totalConversations: { type: Number, default: 0 },
    totalFilesUploaded: { type: Number, default: 0 },
    totalVoiceGenerated: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update stats method
userSchema.methods.updateStats = function(statType) {
  this.stats[statType] += 1;
  this.updatedAt = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
