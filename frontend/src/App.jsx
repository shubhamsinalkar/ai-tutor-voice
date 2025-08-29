// src/App.jsx (COMPLETE WITH LOCATION SAVING IN PROTECTEDROUTE)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Quiz from './pages/Quiz';
import History from './pages/History';

// ✅ UPDATED PROTECTED ROUTE COMPONENT (saves original location)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // ✅ THIS IS THE KEY CHANGE - saves location in state
  return isAuthenticated ? children : (
    <Navigate 
      to="/login" 
      state={{ from: location }} 
      replace 
    />
  );
};

// Layout for Protected Routes (with Navbar)
const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* ✅ PUBLIC ROUTES - Available to Everyone */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        
        {/* ✅ PROTECTED ROUTES - Require Authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Chat />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/upload" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Upload />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/quiz" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Quiz />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <History />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        {/* ✅ CATCH-ALL ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
