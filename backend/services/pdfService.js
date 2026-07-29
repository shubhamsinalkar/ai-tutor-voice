// services/pdfService.js
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const processPDF = async (filePath) => {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      pages.push(textContent.items.map((item) => item.str).join(' '));
    }

    const text = pages.join('\n').trim();
    if (!text) {
      throw new Error('No readable text was found in this PDF. Please upload a text-based PDF.');
    }
    
    // Extract useful information
    const pdfInfo = {
      text,
      numPages: pdf.numPages,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      // Simple topic extraction (we'll enhance with AI later)
      topics: extractTopics(text)
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
