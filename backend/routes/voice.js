// routes/voice.js (REAL AUDIO FILE SERVING)
import express from 'express';
import path from 'path';
import fs from 'fs';
import authenticateToken from '../middleware/auth.js';
import { voiceService } from '../services/voiceService.js';

const router = express.Router();

// Download real generated audio files
router.get('/download/:filename', authenticateToken, (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security validation
    if (!filename.match(/^[a-zA-Z0-9_-]+\.mp3$/)) {
      return res.status(400).json({ error: 'Invalid filename format' });
    }

    const filePath = path.join('audio_output', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Audio file not found:', filePath);
      return res.status(404).json({ 
        error: 'Audio file not found',
        filename: filename 
      });
    }

    console.log(`🎵 Serving real audio file: ${filename} to user ${req.user.userId}`);

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Set proper headers for MP3 streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Handle range requests for audio seeking
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);
      
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Stream entire file
      const audioStream = fs.createReadStream(filePath);
      audioStream.pipe(res);
    }

  } catch (error) {
    console.error('❌ Audio download error:', error.message);
    res.status(500).json({ error: 'Failed to download audio file' });
  }
});

// Test Murf API connection
router.get('/test-connection', authenticateToken, async (req, res) => {
  try {
    const connectionTest = await voiceService.testConnection();
    res.json({
      success: true,
      connection: connectionTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available Murf voices
router.get('/voices', authenticateToken, async (req, res) => {
  try {
    const voices = await voiceService.getAvailableVoices();
    res.json({
      success: true,
      voices: voices,
      total: voices.length,
      provider: 'Murf AI'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get available voices'
    });
  }
});

// Voice service health check
router.get('/health', async (req, res) => {
  try {
    const health = await voiceService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
