import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClipboard, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiAward, FiClock, FiCalendar, FiPlay, FiBookOpen, FiLogOut, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    averageScore: 0
  });
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Update statistics based on exams and completed exams
  const updateStats = useCallback((examList, completedList) => {
    const total = examList.length;
    
    // Get valid exam IDs from the current exam list
    const validExamIds = new Set(examList.map(exam => exam.id));
    
    // Filter completed exams that actually exist in current exam list
    const validCompletedExams = completedList.filter(completed => 
      validExamIds.has(completed.id)
    );
    
    const completed = validCompletedExams.length;
    const pending = total - completed;
    
    // Calculate average score from valid completed exams
    let averageScore = 0;
    if (completed > 0) {
      const totalPercentage = validCompletedExams.reduce((sum, exam) => sum + (exam.percentage || 0), 0);
      averageScore = Math.round(totalPercentage / completed);
    }
    
    setStats({
      total,
      completed,
      pending,
      averageScore
    });
    
    // Update completedExams state with only valid ones
    setCompletedExams(validCompletedExams);
    
    // Clean up localStorage by removing invalid entries
    if (validCompletedExams.length !== completedList.length) {
      localStorage.setItem('completedExams', JSON.stringify(validCompletedExams));
    }
  }, []);

  // Fetch completed exams from localStorage
  const fetchCompletedExams = useCallback(() => {
    try {
      const storedCompleted = localStorage.getItem('completedExams');
      if (storedCompleted) {
        const completed = JSON.parse(storedCompleted);
        // Ensure it's an array
        if (Array.isArray(completed)) {
          return completed;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching completed exams:', error);
      return [];
    }
  }, []);

  // Reset all completed exams
  const resetCompletedExams = useCallback(() => {
    localStorage.removeItem('completedExams');
    setCompletedExams([]);
    updateStats(exams, []);
    toast.success('All exam records have been reset');
  }, [exams, updateStats]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchExams = useCallback(async () => {
    try {
      // Enhanced mock exam data with 16 exams
      const mockExams = [
        { id: 1, title: "Mathematics Final Exam", description: "Comprehensive exam covering algebra, calculus, and geometry", duration_minutes: 120, total_questions: 50, total_marks: 100, subject: "Mathematics", difficulty: "Hard" },
        { id: 2, title: "Physics Midterm", description: "Topics include mechanics, thermodynamics, and electromagnetism", duration_minutes: 90, total_questions: 40, total_marks: 80, subject: "Physics", difficulty: "Medium" },
        { id: 3, title: "Computer Science Test", description: "Data structures, algorithms, and programming concepts", duration_minutes: 60, total_questions: 30, total_marks: 60, subject: "Computer Science", difficulty: "Medium" },
        { id: 4, title: "English Literature", description: "Grammar, vocabulary, and comprehension", duration_minutes: 75, total_questions: 45, total_marks: 90, subject: "English", difficulty: "Easy" },
        { id: 5, title: "Chemistry Advanced", description: "Organic chemistry, inorganic chemistry, and chemical reactions", duration_minutes: 100, total_questions: 50, total_marks: 100, subject: "Chemistry", difficulty: "Hard" },
        { id: 6, title: "Biology Basics", description: "Cell biology, genetics, human anatomy, and ecology", duration_minutes: 80, total_questions: 40, total_marks: 80, subject: "Biology", difficulty: "Medium" },
        { id: 7, title: "History & Civilization", description: "World history, ancient civilizations, and modern events", duration_minutes: 90, total_questions: 50, total_marks: 100, subject: "History", difficulty: "Medium" },
        { id: 8, title: "Geography & Environment", description: "Physical geography, climate, environmental science", duration_minutes: 70, total_questions: 35, total_marks: 70, subject: "Geography", difficulty: "Easy" },
        { id: 9, title: "Economics Fundamentals", description: "Microeconomics, macroeconomics, and economic policies", duration_minutes: 85, total_questions: 45, total_marks: 90, subject: "Economics", difficulty: "Medium" },
        { id: 10, title: "Political Science", description: "Political systems, governance, international relations", duration_minutes: 80, total_questions: 40, total_marks: 80, subject: "Political Science", difficulty: "Medium" },
        { id: 11, title: "Psychology 101", description: "Introduction to psychology, human behavior, and mental processes", duration_minutes: 75, total_questions: 40, total_marks: 80, subject: "Psychology", difficulty: "Easy" },
        { id: 12, title: "Sociology Basics", description: "Social structures, culture, inequality, and social change", duration_minutes: 70, total_questions: 35, total_marks: 70, subject: "Sociology", difficulty: "Easy" },
        { id: 13, title: "Philosophy & Ethics", description: "Critical thinking, moral philosophy, and ethical theories", duration_minutes: 80, total_questions: 40, total_marks: 80, subject: "Philosophy", difficulty: "Hard" },
        { id: 14, title: "Data Science & AI", description: "Machine learning, data analysis, neural networks, and AI concepts", duration_minutes: 120, total_questions: 50, total_marks: 100, subject: "Data Science", difficulty: "Hard" },
        { id: 15, title: "Business Management", description: "Leadership, organizational behavior, strategic management", duration_minutes: 90, total_questions: 45, total_marks: 90, subject: "Business", difficulty: "Medium" },
        { id: 16, title: "Art & Design", description: "Art history, design principles, visual communication", duration_minutes: 65, total_questions: 30, total_marks: 60, subject: "Arts", difficulty: "Easy" }
      ];
      
      setExams(mockExams);
      const completed = fetchCompletedExams();
      updateStats(mockExams, completed);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [fetchCompletedExams, updateStats]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleStartExam = (examId) => {
    const isCompleted = completedExams.some(exam => exam.id === examId);
    if (isCompleted) {
      toast.error('You have already completed this exam!');
      return;
    }
    navigate(`/exam/${examId}`);
  };

  const statsCards = [
    { icon: FiClipboard, label: 'Total Exams', value: stats.total, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', description: 'Available exams' },
    { icon: FiCheckCircle, label: 'Completed', value: stats.completed, bgColor: 'bg-green-100', iconColor: 'text-green-600', description: 'Successfully finished' },
    { icon: FiAlertCircle, label: 'Pending', value: stats.pending, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', description: 'Yet to complete' },
    { icon: FiTrendingUp, label: 'Average Score', value: `${stats.averageScore}%`, bgColor: 'bg-purple-100', iconColor: 'text-purple-600', description: 'Overall performance' },
  ];

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ExamCard = ({ exam, onStart, isCompleted }) => (
    <motion.div whileHover={{ y: -8 }} className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-75 hover:opacity-100' : 'hover:shadow-2xl'}`}>
      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg ${isCompleted ? 'bg-gradient-to-r from-gray-500 to-gray-600' : ''}`}>
              {isCompleted ? <FiCheckCircle className="text-white text-xl" /> : <FiBookOpen className="text-white text-xl" />}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(exam.difficulty)}`}>{exam.difficulty}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{exam.title}</h3>
          <p className="text-xs text-purple-600 mb-2">{exam.subject}</p>
          <p className="text-gray-600 text-sm line-clamp-2">{exam.description}</p>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500"><FiClock className="text-blue-500" /><span>Duration</span></div>
            <span className="font-semibold text-purple-600">{exam.duration_minutes} mins</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500"><FiCalendar className="text-blue-500" /><span>Questions</span></div>
            <span className="font-semibold">{exam.total_questions} questions</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500"><FiAward className="text-yellow-500" /><span>Total Marks</span></div>
            <span className="font-semibold">{exam.total_marks}</span>
          </div>
          {isCompleted && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Your Score</span>
                <span className="font-semibold text-green-600">{completedExams.find(e => e.id === exam.id)?.score || 0}/{exam.total_marks}</span>
              </div>
            </div>
          )}
        </div>

        <button onClick={onStart} disabled={isCompleted} className={`w-full px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${isCompleted ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'}`}>
          {isCompleted ? <><FiCheckCircle /> Completed</> : <><FiPlay /> Start Exam</>}
        </button>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center"><div className="spinner mx-auto mb-4"></div><p className="text-gray-600">Loading dashboard...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-b-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header with Logout Button */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Student Dashboard</h1>
                <p className="text-white/90">Welcome back, {user?.full_name || user?.email?.split('@')[0] || 'Student'}! You've completed {stats.completed} out of {stats.total} exams</p>
              </div>
              
              {/* User Info & Logout Button */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                  </div>
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border border-white/30"
                >
                  <FiLogOut className="text-lg" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`text-2xl ${stat.iconColor}`} />
                </div>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1 + 0.3 }} className="text-3xl font-bold text-gray-800">
                  {stat.value}
                </motion.span>
              </div>
              <h3 className="text-gray-600 font-medium">{stat.label}</h3>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {stats.completed > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">🎉 Great Progress!</h3>
                <p className="text-white/90">You have completed {stats.completed} exam(s) with an average score of {stats.averageScore}%</p>
              </div>
              <div className="text-4xl">{stats.averageScore >= 70 ? '🏆' : stats.averageScore >= 50 ? '📈' : '💪'}</div>
            </div>
            <div className="mt-4 w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.averageScore}%` }}></div>
            </div>
          </motion.div>
        )}

        <motion.div id="exams-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Available Exams</h2>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
              <FiAward className="text-purple-500" />
              <span className="text-sm text-gray-600 font-medium">{stats.pending} exams pending • {stats.completed} completed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const isCompleted = completedExams.some(e => e.id === exam.id);
              return <ExamCard key={exam.id} exam={exam} onStart={() => handleStartExam(exam.id)} isCompleted={isCompleted} />;
            })}
          </div>
        </motion.div>

        {/* Reset Button - Only show when there are corrupted entries */}
        {stats.completed > stats.total && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-red-700">⚠️ Data Mismatch Detected</h4>
                  <p className="text-xs text-red-600">Completed exams count exceeds total exams. Click reset to fix.</p>
                </div>
                <button onClick={resetCompletedExams} className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all">
                  Reset All Records
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📝 Exam Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2"><div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</div><p className="text-sm text-gray-700">Ensure stable internet connection before starting</p></div>
            <div className="flex items-start gap-2"><div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</div><p className="text-sm text-gray-700">Find a quiet, well-lit room for your exam</p></div>
            <div className="flex items-start gap-2"><div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</div><p className="text-sm text-gray-700">Keep your webcam and microphone ready</p></div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .spinner { width: 50px; height: 50px; border: 4px solid rgba(102,126,234,0.2); border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// Helper function to mark exam as complete
export const markExamComplete = (examId, score, totalMarks) => {
  try {
    let completedExams = JSON.parse(localStorage.getItem('completedExams') || '[]');
    
    // Ensure it's an array
    if (!Array.isArray(completedExams)) {
      completedExams = [];
    }
    
    const existingIndex = completedExams.findIndex(e => e.id === examId);
    
    if (existingIndex === -1) {
      const completedExam = {
        id: examId,
        completedAt: new Date().toISOString(),
        score: score,
        totalMarks: totalMarks,
        percentage: (score / totalMarks) * 100
      };
      completedExams.push(completedExam);
      localStorage.setItem('completedExams', JSON.stringify(completedExams));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error marking exam complete:', error);
    return false;
  }
};

export default StudentDashboard;