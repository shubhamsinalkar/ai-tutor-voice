import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, voiceAPI } from '../services/api';
import { User, Bot, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory({ page: 1, limit: 20 });
      
      // ✅ FIXED: Check backend response structure
      if (response.data.success && response.data.history?.conversations) {
        const conversations = response.data.history.conversations;
        const messagesArray = conversations.flatMap(conv => [
          { 
            role: 'user', 
            content: conv.question, 
            timestamp: conv.createdAt 
          },
          { 
            role: 'assistant', 
            content: conv.answer, 
            timestamp: conv.createdAt,
            voiceFilename: conv.voiceFile?.filename || null
          }
        ]);
        setMessages(messagesArray);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ FIXED: Added loading check
    if (!inputMessage.trim() || loading) return;

    // ✅ FIXED: Store question before clearing input
    const question = inputMessage.trim();
    const userMessage = { 
      role: 'user', 
      content: question, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatAPI.askQuestion({
        question: question, // ✅ FIXED: Use stored question
        fileId: null,
        includeVoice: audioEnabled,
        
      });
        console.log(response)

      // ✅ FIXED: Check backend success first
      if (response.data.success && response.data.data) {
        const aiData = response.data.data;
        console.log('🔍 Full AI Response:', aiData);
        console.log('🔍 Voice data:', aiData.voice);
        
        const aiMessage = {
          role: 'assistant',
          content: aiData.answer,
          timestamp: new Date(),
          voiceFilename: aiData.voice?.filename || null
        };
        
        console.log('✅ AI Message created with voice filename:', aiMessage.voiceFilename);
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioError = (errorMessage) => {
    console.error('🔥 Audio playback failed:', errorMessage);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };
      recognition.onerror = () => setIsListening(false);

      recognition.start();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Voice Tutor</h1>
              <p className="text-sm text-gray-500">Ask me anything about your studies</p>
            </div>
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              audioEnabled 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={`Audio ${audioEnabled ? 'enabled' : 'disabled'}`}
          >
            {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl inline-block mb-4">
                <Bot className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to AI Voice Tutor!</h3>
              <p className="text-gray-600 mb-6">Start a conversation by asking any question about your studies.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  "Explain quantum physics concepts",
                  "Help me with calculus problems", 
                  "Summarize this chapter for me",
                  "Create a quiz on data structures"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
                    className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ✅ FIXED: Better key and error handling */}
          {messages.map((message, index) => (
            <div
              key={`msg-${index}-${new Date(message.timestamp).getTime()}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-indigo-600' 
                    : message.isError 
                    ? 'bg-red-600' 
                    : 'bg-gradient-to-br from-purple-600 to-pink-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 px-4 py-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : message.isError
                    ? 'bg-red-100 text-red-800'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Audio Player */}
                  {message.voiceFilename && audioEnabled && !message.isError && (
                    <div className="mt-3">
                      <AudioPlayer 
                        filename={message.voiceFilename}
                        onError={handleAudioError}
                      />
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.role === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 px-4 py-3 rounded-2xl bg-white shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows="1"
                disabled={loading}
                onKeyDown={(e) => { // ✅ FIXED: Changed from onKeyPress
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={startListening}
              disabled={isListening || loading}
              className={`p-3 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
