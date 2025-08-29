// services/pdfService.js
import fs from 'fs';
import pdfParse from 'pdf-parse';

// Install pdf-parse first
// npm install pdf-parse

const processPDF = async (filePath) => {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF content
    const data = await pdfParse(dataBuffer);
    
    // Extract useful information
    const pdfInfo = {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      wordCount: data.text.split(' ').length,
      // Simple topic extraction (we'll enhance with AI later)
      topics: extractTopics(data.text)
    };
    
    return pdfInfo;
    
  } catch (error) {
    throw new Error(`PDF processing failed: ${error.message}`);
  }
};

// Simple topic extraction function
const extractTopics = (text) => {
  const topics = [];
  const commonTopics = [
    'neural networks', 'machine learning', 'algorithms', 'data science',
    'mathematics', 'statistics', 'programming', 'database', 'security',
    'physics', 'chemistry', 'biology', 'medicine', 'business', 'economics'
  ];
  
  const lowerText = text.toLowerCase();
  
  commonTopics.forEach(topic => {
    if (lowerText.includes(topic)) {
      topics.push(topic);
    }
  });
  
  return topics.slice(0, 5); // Return max 5 topics
};

export { processPDF };
