// routes/chat.js (UPDATED WITH DATABASE)
import express from 'express';
import authenticateToken from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { voiceService } from '../services/voiceService.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import UploadedFile from '../models/UploadedFile.js';

const router = express.Router();

// Ask question with database storage
router.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { question, fileId, includeVoice = true } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Question is required',
        code: 'INVALID_QUESTION'
      });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`🚀 Processing question from ${user.email}: "${question}"`);

    // Get file content if fileId provided
    let pdfContent = `
    Machine Learning and Artificial Intelligence Fundamentals
    Neural Networks: Computational models inspired by biological neural networks
    Supervised Learning: Learning from labeled training examples
    Unsupervised Learning: Discovering patterns in unlabeled data
    Deep Learning: Multi-layer neural networks for complex pattern recognition
    `;

    if (fileId) {
      const uploadedFile = await UploadedFile.findOne({ 
        _id: fileId, 
        userId: userId,
        status: 'ready'
      });
      
      if (uploadedFile && uploadedFile.processedData.fullText) {
        pdfContent = uploadedFile.processedData.fullText;
        console.log('📄 Using uploaded file content');
      }
    }

    // Generate AI response
    const userContext = {
      university: user.university,
      course: user.course
    };

    const aiResponse = await aiService.generateExplanation(
      question, 
      pdfContent, 
      userContext
    );

    // Generate voice if requested
    let voiceResponse = null;
    if (includeVoice && user.preferences.voiceEnabled) {
      try {
        const subject = detectSubject(question, aiResponse.answer);
        voiceResponse = await voiceService.generateEducationalVoice(
          aiResponse.answer,
          subject
        );
      } catch (voiceError) {
        console.error('⚠️ Voice generation failed:', voiceError.message);
      }
    }

    // Save conversation to database
    const conversation = new Conversation({
      userId: userId,
      fileId: fileId || null,
      question: question.trim(),
      answer: aiResponse.answer,
      aiModel: aiResponse.model,
      voiceGenerated: !!voiceResponse,
      voiceFile: voiceResponse ? {
        filename: voiceResponse.filename,
        duration: voiceResponse.duration,
        size: voiceResponse.size,
        provider: voiceResponse.provider || 'Murf AI'
      } : null,
      metadata: {
        responseTime: new Date(),
        quality: aiResponse.quality || 'high',
        personalized: aiResponse.personalized || true,
        subject: detectSubject(question, aiResponse.answer),
        tokensUsed: aiResponse.tokensUsed || 0
      }
    });

    await conversation.save();

    // Update user stats
    await user.updateStats('totalQuestions');
    await user.updateStats('totalConversations');
    if (voiceResponse) {
      await user.updateStats('totalVoiceGenerated');
    }

    console.log('✅ Conversation saved to database');

    // Response
    const response = {
      success: true,
      message: 'AI response generated successfully',
      data: {
        answer: aiResponse.answer,
        question: question,
        metadata: {
          aiModel: aiResponse.model,
          responseTime: new Date().toISOString(),
          quality: aiResponse.quality || 'high',
          personalized: aiResponse.personalized || true,
          readyForVoice: true,
          voiceGenerated: !!voiceResponse
        },
        voice: voiceResponse ? {
          filename: voiceResponse.filename,
          duration: voiceResponse.duration,
          format: 'mp3',
          downloadUrl: `/api/voice/download/${voiceResponse.filename}`,
          size: voiceResponse.size,
          provider: voiceResponse.provider || 'Murf AI'
        } : null
      },
      session: {
        conversationId: conversation._id,
        totalConversations: user.stats.totalConversations,
        userId: userId
      }
    };

    res.json(response);

  } catch (error) {
    console.error('💥 CHAT ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process your question',
      message: error.message,
      code: 'CHAT_PROCESSING_ERROR'
    });
  }
});

// Get conversation history from database
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalConversations = await Conversation.countDocuments({ userId });
    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('fileId', 'originalName processedData.subject')
      .lean();

    res.json({
      success: true,
      message: 'Conversation history retrieved',
      history: {
        conversations: conversations,
        pagination: {
          page: page,
          limit: limit,
          total: totalConversations,
          totalPages: Math.ceil(totalConversations / limit),
          hasNextPage: page < Math.ceil(totalConversations / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ History retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation history'
    });
  }
});

// routes/chat.js (ADD QUIZ ROUTE)

// Generate quiz endpoint - ADD THIS MISSING ROUTE
router.post('/quiz', authenticateToken, async (req, res) => {
  try {
    const { fileId, numQuestions = 3, difficulty = 'mixed' } = req.body;
    const userId = req.user.userId;

    // Validation
    if (numQuestions < 1 || numQuestions > 10) {
      return res.status(400).json({
        success: false,
        error: 'Number of questions must be between 1 and 10',
        code: 'INVALID_QUESTION_COUNT'
      });
    }

    const allowedDifficulties = ['easy', 'medium', 'hard', 'mixed'];
    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty must be one of: easy, medium, hard, mixed',
        code: 'INVALID_DIFFICULTY'
      });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`📋 Generating ${numQuestions} ${difficulty} quiz questions for ${user.email}`);

    // Get file content if fileId provided
    let pdfContent = `
    Machine Learning and Artificial Intelligence Fundamentals
    
    Core Topics:
    - Neural Networks: Computational models inspired by biological neural networks
    - Supervised Learning: Learning from labeled training examples
    - Unsupervised Learning: Discovering patterns in unlabeled data  
    - Deep Learning: Multi-layer neural networks for complex pattern recognition
    - Algorithms: Step-by-step procedures for problem-solving
    - Data Processing: Techniques for preparing and analyzing data
    - Model Training: Process of teaching algorithms using training data
    - Evaluation Metrics: Methods to assess model performance
    
    Applications include image recognition, natural language processing,
    recommendation systems, autonomous vehicles, and predictive analytics.
    `;

    if (fileId) {
      const uploadedFile = await UploadedFile.findOne({ 
        _id: fileId, 
        userId: userId,
        status: 'ready'
      });
      
      if (uploadedFile && uploadedFile.processedData.fullText) {
        pdfContent = uploadedFile.processedData.fullText;
        console.log('📄 Using uploaded file content for quiz');
      }
    }

    // Generate quiz questions using AI service
    const quizData = await aiService.generateQuizQuestions(pdfContent, numQuestions, difficulty);

    // Update user stats
    await user.updateStats('totalQuestions');

    console.log('✅ Quiz generated successfully');

    const response = {
      success: true,
      message: 'Quiz generated successfully',
      quiz: {
        ...quizData,
        fileId: fileId || null,
        settings: {
          numQuestions: numQuestions,
          difficulty: difficulty,
          subject: detectSubject('', pdfContent)
        }
      },
      metadata: {
        userId: userId,
        userEmail: user.email,
        university: user.university,
        course: user.course,
        generatedAt: new Date().toISOString(),
        readyForVoice: true
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quiz',
      message: 'Please try again or contact support',
      code: 'QUIZ_GENERATION_ERROR'
    });
  }
});


// Helper function
function detectSubject(question, answer) {
  const subjects = {
    'machine learning': ['machine learning', 'ml', 'neural network', 'algorithm'],
    'programming': ['programming', 'code', 'coding', 'software'],
    'mathematics': ['math', 'calculation', 'equation', 'formula'],
    'science': ['science', 'physics', 'chemistry', 'biology']
  };

  const text = (question + ' ' + answer).toLowerCase();
  
  for (const [subject, keywords] of Object.entries(subjects)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return subject;
    }
  }
  
  return 'general';
}

export default router;
