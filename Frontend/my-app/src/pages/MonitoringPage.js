import React from 'react';
import { useParams } from 'react-router-dom';

const MonitoringPage = () => {
  const { examId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Live Monitoring - Exam {examId}</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Live proctoring feed will appear here...</p>
      </div>
    </div>
  );
};

export default MonitoringPage;