import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import MonitoringPage from './pages/MonitoringPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: 'white',
                  secondary: '#10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: 'white',
                  secondary: '#ef4444',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<StudentLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/exam/:examId" element={<ExamPage />} />
                <Route path="/results/:attemptId" element={<ResultPage />} />
              </Route>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/monitoring/:examId" element={<MonitoringPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>
            
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;