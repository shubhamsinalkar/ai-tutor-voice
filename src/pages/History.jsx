import React, { useState, useEffect } from 'react';
import { chatAPI, uploadAPI } from '../services/api';
import { 
  History as HistoryIcon, 
  MessageSquare, 
  Upload as UploadIcon, 
  HelpCircle, 
  Calendar,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Bot
} from 'lucide-react';

const History = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [chatHistory, setChatHistory] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [chatResponse, uploadResponse] = await Promise.all([
        chatAPI.getHistory({ page: 1, limit: 50 }),
        uploadAPI.getMyFiles()
      ]);

      const conversations = chatResponse.data.history?.conversations || [];
      setChatHistory(conversations);

      const files = uploadResponse.data.files || [];
      setUploadHistory(files);

      setQuizHistory([]);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredHistory = () => {
    let allItems = [];

    if (activeTab === 'all' || activeTab === 'chats') {
      allItems = [...allItems, ...chatHistory.map(item => ({ ...item, type: 'chat' }))];
    }
    if (activeTab === 'all' || activeTab === 'quizzes') {
      allItems = [...allItems, ...quizHistory.map(item => ({ ...item, type: 'quiz' }))];
    }
    if (activeTab === 'all' || activeTab === 'uploads') {
      allItems = [...allItems, ...uploadHistory.map(item => ({ ...item, type: 'upload' }))];
    }

    return allItems.sort((a, b) => new Date(b.createdAt || b.uploadedAt) - new Date(a.createdAt || a.uploadedAt));
  };

  const tabs = [
    { id: 'all', label: 'All Activity', icon: HistoryIcon },
    { id: 'chats', label: 'Conversations', icon: MessageSquare },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
    { id: 'uploads', label: 'Uploads', icon: UploadIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredHistory = getFilteredHistory();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-orange-600 to-red-600 p-4 rounded-2xl inline-block mb-4">
            <HistoryIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning History</h1>
          <p className="text-xl text-gray-600">
            Track your progress and review past activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{chatHistory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <HelpCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-900">{quizHistory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <UploadIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
                <p className="text-2xl font-bold text-gray-900">{uploadHistory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Quiz Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizHistory.length > 0 
                    ? Math.round(quizHistory.reduce((acc, quiz) => acc + (quiz.score || 0), 0) / quizHistory.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <HistoryIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-500">
                  Start using AI Voice Tutor to see your learning history here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'chat' ? 'bg-blue-100' :
                      item.type === 'quiz' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      {item.type === 'chat' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                      {item.type === 'quiz' && <HelpCircle className="h-5 w-5 text-purple-600" />}
                      {item.type === 'upload' && <FileText className="h-5 w-5 text-green-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.type === 'chat' && `AI Conversation: ${item.question?.substring(0, 50)}...`}
                            {item.type === 'quiz' && item.title}
                            {item.type === 'upload' && item.fileName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.type === 'chat' && `Question asked and answered`}
                            {item.type === 'quiz' && `${item.questions || 0} questions • Score: ${item.score || 0}%`}
                            {item.type === 'upload' && `${((item.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.createdAt || item.uploadedAt)}</span>
                          </div>
                          {item.type === 'quiz' && item.score >= 80 && (
                            <div className="flex items-center space-x-1 text-sm text-green-600 mt-1">
                              <Award className="h-3 w-3" />
                              <span>Excellent!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
