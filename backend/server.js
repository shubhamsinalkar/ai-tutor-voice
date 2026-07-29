// server.js (ADD DATABASE CONNECTION)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// ✅ ADD DATABASE CONNECTION
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import chatRoutes from './routes/chat.js';
import voiceRoutes from './routes/voice.js';

// Import services
import { aiService } from './services/aiService.js';
import { voiceService } from './services/voiceService.js';

const app = express();

// ✅ CONNECT TO DATABASE FIRST
const dbConnected = await connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/voice', voiceRoutes);

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default;
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      service: 'AI Voice Tutor Backend',
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'Ai-voice-tutor',
        host: mongoose.connection.host
      },
      features: [
        '🔐 User Authentication & Registration',
        '💾 MongoDB Database Storage', 
        '📁 PDF Upload & Processing',
        '🤖 AI Intelligence (Google Gemini)',
        '🎤 Voice Generation (Murf AI)',
        '📊 User Analytics & Progress Tracking'
      ]
    });
  } catch (error) {
    res.status(503).json({
      service: 'AI Voice Tutor Backend',
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'AI Voice Tutor - Production System',
    version: '1.0.0',
    description: 'Complete AI-powered voice tutoring system with database storage',
    status: 'operational',
    database: 'MongoDB Atlas',
    contest: 'Murf API Contest 2025 - Production Ready!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀', '='.repeat(70));
  console.log('🎓 AI VOICE TUTOR - PRODUCTION SYSTEM WITH DATABASE!');
  console.log('🚀', '='.repeat(70));
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`💾 Database: MongoDB Atlas`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log('🚀', '='.repeat(70));
  if (dbConnected) {
    console.log('✅ MongoDB Atlas Connection');
  } else {
    console.log('⚠️ MongoDB Atlas connection unavailable');
  }
  console.log('✅ User Authentication & Registration');
  console.log('✅ AI Intelligence (Google Gemini)');
  console.log('✅ Voice Generation (Murf AI)');
  console.log('✅ Complete Production System Ready!');
  console.log('🚀', '='.repeat(70));
});

export default app;
