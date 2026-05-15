import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const ResultPage = () => {
  const { attemptId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Exam Submitted Successfully!</h1>
        <p className="text-gray-600 mb-6">Your exam has been recorded and will be reviewed.</p>
        <p className="text-gray-600 mb-8">Attempt ID: {attemptId}</p>
        <Link to="/student/dashboard" className="btn-primary inline-flex items-center gap-2">
          <FiHome />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ResultPage;