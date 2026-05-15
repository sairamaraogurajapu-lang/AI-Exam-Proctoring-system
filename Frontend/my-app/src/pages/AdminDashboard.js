import React from 'react';
import { FiUsers, FiFileText, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const AdminDashboard = () => {
  const stats = {
    totalStudents: 150,
    totalExams: 25,
    activeExams: 3,
    violations: 12,
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage proctoring system</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
            <FiUsers className="text-blue-500 text-3xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Exams</p>
              <p className="text-2xl font-bold">{stats.totalExams}</p>
            </div>
            <FiFileText className="text-green-500 text-3xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Exams</p>
              <p className="text-2xl font-bold">{stats.activeExams}</p>
            </div>
            <FiCheckCircle className="text-yellow-500 text-3xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Violations</p>
              <p className="text-2xl font-bold">{stats.violations}</p>
            </div>
            <FiAlertCircle className="text-red-500 text-3xl" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">Monitoring data will appear here...</p>
      </div>
    </div>
  );
};

export default AdminDashboard;