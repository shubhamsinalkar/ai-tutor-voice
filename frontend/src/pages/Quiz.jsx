import React, { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { HelpCircle, CheckCircle, X, Award, Clock, BookOpen } from 'lucide-react';

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await chatAPI.getHistory();
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const generateNewQuiz = async () => {
    setGenerating(true);
    try {
      const response = await chatAPI.generateQuiz({
        fileId: null,
        numQuestions: 5,
        difficulty: 'medium'
      });
      
      const quizData = response.data.quiz;
      
      setCurrentQuiz({
        id: Date.now(),
        title: `Generated Quiz - ${new Date().toLocaleDateString()}`,
        questions: quizData.questions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          options: [
            q.answer,
            'Alternative answer 1',
            'Alternative answer 2',
            'Alternative answer 3'
          ].sort(() => Math.random() - 0.5),
          correctAnswer: q.answer
        }))
      });
      
      setAnswers({});
      setResults(null);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const submitQuiz = () => {
    if (!currentQuiz) return;
    
    setLoading(true);
    
    // Calculate results locally
    let correct = 0;
    const total = currentQuiz.questions.length;
    
    currentQuiz.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    setTimeout(() => {
      setResults({ correct, total });
      setLoading(false);
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setAnswers({});
    setResults(null);
  };

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="bg-gradient-to-br from-green-600 to-teal-600 p-4 rounded-2xl inline-block mb-6">
              <Award className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h1>
            <div className="text-6xl font-bold text-green-600 mb-2">
              {Math.round((results.correct / results.total) * 100)}%
            </div>
            <p className="text-xl text-gray-600 mb-8">
              You got {results.correct} out of {results.total} questions correct
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Take Another Quiz
              </button>
              <a
                href="/chat"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Ask AI About Mistakes
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuiz) {
    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = currentQuiz.questions.length;
    const canSubmit = answeredQuestions === totalQuestions;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentQuiz.title}</h1>
                <p className="text-gray-600">Answer all questions to see your results</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-lg font-semibold text-indigo-600">
                  {answeredQuestions} / {totalQuestions}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-8">
              {currentQuiz.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          answers[question.id] === option
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerSelect(question.id, option)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border-2 rounded-full mr-3 ${
                          answers[question.id] === option
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[question.id] === option && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={submitQuiz}
                disabled={!canSubmit || loading}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  canSubmit && !loading
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner w-4 h-4 border-2"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl inline-block mb-6">
            <HelpCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Knowledge Testing</h1>
          <p className="text-xl text-gray-600">
            Test your understanding with AI-generated quizzes
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate New Quiz</h2>
            <p className="text-gray-600 mb-6">
              Create a personalized quiz based on your uploaded study materials
            </p>
            <button
              onClick={generateNewQuiz}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {generating ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner w-5 h-5 border-2"></div>
                  <span>Generating Quiz...</span>
                </div>
              ) : (
                'Generate New Quiz'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
