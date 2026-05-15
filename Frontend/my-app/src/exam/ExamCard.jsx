import React from 'react';
import { FiClock, FiCalendar, FiPlay } from 'react-icons/fi';
import { format } from 'date-fns';

const ExamCard = ({ exam, onStart }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{exam.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {exam.description || 'No description available'}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <FiClock className="text-blue-500" />
          <span>Duration: {exam.duration_minutes} minutes</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <FiCalendar className="text-blue-500" />
          <span>Start: {format(new Date(exam.start_time), 'PPP p')}</span>
        </div>
      </div>
      
      <button
        onClick={onStart}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
      >
        <FiPlay />
        Start Exam
      </button>
    </div>
  );
};

export default ExamCard;