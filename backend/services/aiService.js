// services/aiService.js (FIXED FOR CURRENT GEMINI API)
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
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
        model: 'gemini-1.5-flash-enhanced',
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
    // ✅ BUILD ONE COMPREHENSIVE PROMPT STRING
    let prompt = `You are an enthusiastic AI voice tutor who loves helping students learn! Your job is to provide clear, engaging explanations that sound natural when spoken aloud.

🎯 YOUR PERSONALITY:
- Be encouraging and supportive
- Use conversational, friendly language
- Break complex topics into simple steps
- Use analogies and real-world examples
- Show genuine excitement about teaching

📚 STUDENT CONTEXT:
- University: ${userContext.university || 'Not specified'}
- Course: ${userContext.course || 'General studies'}
- Academic Level: Undergraduate

`;

    // ✅ ADD UPLOADED CONTENT IF AVAILABLE
    if (pdfContent && pdfContent.trim().length > 0) {
      prompt += `📄 STUDENT'S UPLOADED STUDY MATERIAL:
"${pdfContent.substring(0, 1200)}"

Use this material as your primary reference. Connect your explanation directly to what the student is studying.

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

Generate your response now:`;

    return prompt;
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
        model: 'gemini-1.5-flash-enhanced'
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
