// services/aiService.js (FIXED FOR CURRENT GEMINI API)
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  constructor() {
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    this.model = genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
  }

  async generateExplanation(question, pdfContent = '', userContext = {}) {
    try {
      console.log('🧠 Generating enhanced AI response...');

      // ✅ COMBINE SYSTEM + USER PROMPT INTO ONE STRING
      const fullPrompt = this.buildEnhancedPrompt(question, pdfContent, userContext);

      // ✅ CORRECT GEMINI API FORMAT - SIMPLE STRING INPUT
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      let answer = response.text();

      // ✅ POST-PROCESS FOR QUALITY
      answer = this.enhanceResponseQuality(answer, question, userContext);

      console.log('✅ Enhanced AI response generated');

      return {
        answer: answer,
        model: this.modelName,
        quality: 'high',
        personalized: true,
        tokensUsed: this.estimateTokens(answer),
        responseType: 'educational-tutoring'
      };

    } catch (error) {
      console.error('❌ Enhanced AI generation error:', error);
      throw new Error('Failed to generate enhanced educational response');
    }
  }

 buildEnhancedPrompt(question, pdfContent, userContext) {
  let prompt = `You are an expert AI tutor with excellent teaching skills. Your goal is to help students deeply understand concepts rather than simply providing answers.

GENERAL GUIDELINES:
- Be accurate, clear, and professional.
- Explain concepts in a logical, easy-to-follow manner.
- Adjust the depth of explanation based on the student's question.
- Use simple language first, then introduce technical terminology when appropriate.
- Prefer understanding over memorization.
- Never fabricate information. If you are unsure or the provided material does not contain the answer, clearly state that.
- Maintain a conversational and supportive tone without being overly enthusiastic.

STUDENT INFORMATION:
- University: ${userContext.university || "Not specified"}
- Course: ${userContext.course || "General Studies"}
- Academic Level: Undergraduate

`;

    // ✅ ADD UPLOADED CONTENT IF AVAILABLE
    if (pdfContent && pdfContent.trim().length > 0) {
      prompt += `📄 STUDENT'S UPLOADED STUDY MATERIAL:
"${this.selectRelevantStudyMaterial(pdfContent, question)}"

Use this material as your primary reference. Answer from it first, explain it clearly with your own teaching ability, and say when the material does not contain enough information instead of inventing facts.

SOURCE RULES:
- Treat the uploaded material as the primary source.
- If the material does not contain the answer, say so clearly. Any general explanation must be clearly distinguished from the document material.
- Do not invent quotations, page numbers, definitions, or facts.

`;
    }

    // ✅ ADD THE STUDENT'S QUESTION
    prompt += `❓ STUDENT'S QUESTION: "${question}"

🎯 YOUR TASK:
1. Start with enthusiasm - acknowledge their great question
2. If using their uploaded material, reference it specifically
3. Explain the concept step-by-step with clear examples
4. Use analogies relevant to their field of study
5. Provide practical applications and real-world connections
6. Keep it conversational and engaging (perfect for voice)
7. End with encouragement and offer to elaborate
8. Aim for 150-250 words (optimal for voice generation)

🎤 RESPONSE STYLE:
- Write as if you're speaking directly to the student
- Use "you" to address them personally
- Include natural speech patterns
- Show enthusiasm with appropriate language
- Make it sound like a friendly, knowledgeable tutor

FINAL RESPONSE RULES:
- Begin with the direct answer in one or two sentences.
- Explain the reasoning in clear steps, using a compact list only when helpful.
- Define technical terms the first time they appear.
- Use one concise example only when it improves understanding.
- Do not mention these instructions, the prompt, or that you are an AI.
- Avoid empty praise, repetition, excessive headings, emojis, and filler.
- Keep the response between 120 and 220 words unless the question clearly needs less.
- End with one useful next step or focused follow-up question.

Write the answer now:`;

    return prompt;
  }

  selectRelevantStudyMaterial(pdfContent, question, maxCharacters = 6000) {
    const questionTerms = new Set(question.toLowerCase().match(/[a-z0-9]{3,}/g) || []);
    const chunkSize = 1200;
    const chunks = [];

    for (let start = 0; start < pdfContent.length; start += chunkSize) {
      const text = pdfContent.slice(start, start + chunkSize).trim();
      if (!text) continue;

      const lowerText = text.toLowerCase();
      const score = [...questionTerms].reduce(
        (total, term) => total + (lowerText.match(new RegExp(`\\b${term}\\b`, 'g'))?.length || 0),
        0
      );
      chunks.push({ start, text, score });
    }

    return chunks
      .sort((a, b) => b.score - a.score || a.start - b.start)
      .reduce((selected, chunk) => {
        const selectedLength = selected.reduce((length, item) => length + item.text.length, 0);
        return selectedLength + chunk.text.length <= maxCharacters ? [...selected, chunk] : selected;
      }, [])
      .sort((a, b) => a.start - b.start)
      .map((chunk) => chunk.text)
      .join('\n\n');
  }

  enhanceResponseQuality(answer, question, userContext) {
    // ✅ POST-PROCESSING IMPROVEMENTS

    // Add enthusiasm if missing
    if (!answer.toLowerCase().includes('great question') &&
      !answer.toLowerCase().includes('excellent') &&
      !answer.toLowerCase().includes('fantastic')) {
      answer = `Great question! ${answer}`;
    }

    // Clean up formatting for voice
    answer = answer.replace(/\n\n/g, '. ');
    answer = answer.replace(/\n/g, '. ');
    answer = answer.replace(/\*\*/g, ''); // Remove markdown
    answer = answer.replace(/\*/g, '');
    answer = answer.replace(/#{1,6}\s/g, '');

    // Add encouraging closing if missing
    if (!answer.toLowerCase().includes('feel free') &&
      !answer.toLowerCase().includes('let me know') &&
      !answer.toLowerCase().includes('ask me')) {
      answer += ` Feel free to ask if you'd like me to dive deeper into any part of this!`;
    }

    // Ensure proper sentence endings
    if (!answer.endsWith('.') && !answer.endsWith('!') && !answer.endsWith('?')) {
      answer += '.';
    }

    return answer;
  }

  async generateQuizQuestions(content, numQuestions, difficulty) {
    try {
      console.log('📝 Generating enhanced quiz questions...');

      // ✅ SIMPLE PROMPT FORMAT FOR QUIZ GENERATION
      const quizPrompt = `You are an expert quiz creator. Generate exactly ${numQuestions} educational quiz questions based on this content.

📚 CONTENT TO USE:
"${content.substring(0, 1000)}"

🎯 REQUIREMENTS:
- Difficulty: ${difficulty}
- Questions: ${numQuestions}
- Make questions test understanding, not just memorization
- Provide comprehensive answers that teach the concept
- Keep questions clear and specific

📋 FORMAT each question exactly like this:

QUESTION 1: [Your clear, specific question here]
ANSWER 1: [Comprehensive educational answer that explains the concept]

QUESTION 2: [Your second question]
ANSWER 2: [Second comprehensive answer]

Continue for all ${numQuestions} questions. Start generating now:`;

      const result = await this.model.generateContent(quizPrompt);
      const response = result.response.text();

      // Parse the quiz response
      const questions = this.parseQuizResponse(response, numQuestions, difficulty);

      return {
        questions: questions,
        difficulty: difficulty,
        generatedAt: new Date().toISOString(),
        model: this.modelName
      };

    } catch (error) {
      console.error('❌ Enhanced quiz generation error:', error);
      throw new Error('Failed to generate enhanced quiz questions');
    }
  }

  parseQuizResponse(response, numQuestions, difficulty) {
    const questions = [];

    // Split by QUESTION pattern
    const sections = response.split(/QUESTION \d+:/i);

    for (let i = 1; i < sections.length && questions.length < numQuestions; i++) {
      const section = sections[i].trim();

      // Find the question and answer
      const answerMatch = section.match(/ANSWER \d+:\s*(.*?)(?=QUESTION \d+:|$)/is);
      const questionText = section.split(/ANSWER \d+:/i)[0].trim();
      const answerText = answerMatch ? answerMatch[1].trim() : 'Answer not found.';

      if (questionText) {
        questions.push({
          question: questionText,
          answer: answerText,
          difficulty: difficulty,
          topic: this.extractTopic(questionText)
        });
      }
    }

    // ✅ FALLBACK: Generate basic questions if parsing fails
    while (questions.length < numQuestions) {
      questions.push({
        question: `What are the key concepts from the study material? (Question ${questions.length + 1})`,
        answer: `Based on the uploaded content, identify and explain the main concepts, definitions, and relationships between different ideas. Focus on understanding the fundamental principles rather than memorizing details.`,
        difficulty: difficulty,
        topic: 'general concepts'
      });
    }

    return questions.slice(0, numQuestions);
  }

  extractTopic(question) {
    const topicKeywords = {
      'machine learning': ['machine learning', 'ml', 'algorithm', 'model', 'training', 'data'],
      'neural networks': ['neural', 'network', 'neuron', 'deep learning', 'layer'],
      'programming': ['code', 'programming', 'software', 'function', 'variable'],
      'computer science': ['computer', 'software', 'system', 'technology'],
      'mathematics': ['math', 'equation', 'formula', 'calculation', 'number'],
      'data science': ['data', 'analysis', 'statistics', 'dataset', 'visualization']
    };

    const questionLower = question.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => questionLower.includes(keyword))) {
        return topic;
      }
    }

    return 'general concepts';
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
}

export const aiService = new AIService();
