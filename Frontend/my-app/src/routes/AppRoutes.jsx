import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import StudentDashboard from '../pages/StudentDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ExamPage from '../pages/ExamPage';
import ResultPage from '../pages/ResultPage';
import MonitoringPage from '../pages/MonitoringPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';

const AppRoutes = () => {
  const userRole = localStorage.getItem('userRole');
  
  return (
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
  );
};

export default AppRoutes;