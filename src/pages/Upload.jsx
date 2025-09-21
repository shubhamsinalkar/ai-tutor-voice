import React, { useState, useCallback } from 'react';
import { uploadAPI } from '../services/api';
import { Upload as UploadIcon, File, CheckCircle, X, FileText } from 'lucide-react';

const Upload = () => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    setError('');
    setUploading(true);

    for (const file of files) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await uploadAPI.uploadFile(formData);
        setUploadedFiles(prev => [...prev, {
          id: response.data.fileId || response.data.id,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
          status: 'uploaded'
        }]);
      } catch (error) {
        console.error('Upload error:', error);
        setError(error.response?.data?.message || 'Upload failed');
      }
    }

    setUploading(false);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-green-600 to-teal-600 p-4 rounded-2xl inline-block mb-4">
              <UploadIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Study Materials</h1>
            <p className="text-gray-600">
              Upload your PDF documents to start AI-powered learning sessions
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragOver 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            <div className="max-w-sm mx-auto">
              <UploadIcon className={`h-16 w-16 mx-auto mb-4 transition-colors ${
                dragOver ? 'text-green-600' : 'text-gray-400'
              }`} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {dragOver ? 'Drop files here' : 'Upload PDF Files'}
              </h3>
              <p className="text-gray-600 mb-6">
                Drag and drop your PDF files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 cursor-pointer inline-block"
              >
                Choose Files
              </label>
              <p className="text-sm text-gray-500 mt-3">
                Supports: PDF files up to 10MB each
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {uploading && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="loading-spinner w-5 h-5"></div>
                <span className="text-blue-700 font-medium">Uploading files...</span>
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Files</h2>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(file.size)} • Uploaded {file.uploadedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What's Next?</h3>
              <p className="text-gray-600 mb-4">
                Your files have been processed! Now you can:
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <a
                  href="/chat"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
                >
                  Start AI Chat
                </a>
                <a
                  href="/quiz"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
                >
                  Generate Quiz
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
