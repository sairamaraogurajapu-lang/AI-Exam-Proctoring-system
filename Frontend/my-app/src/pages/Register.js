import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiUserPlus, FiShield, FiBriefcase, FiCalendar, FiHash } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    student_id: '',
    department: '',
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    if (result.success) {
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-4">
            <FiShield className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join AI Proctoring System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-purple-500 focus:outline-none transition-all duration-300"
                placeholder="John Doe"
                required
              />
            </div>
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-purple-500 focus:outline-none transition-all duration-300"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
          
          {/* Student ID & Department Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID
              </label>
              <div className="relative group">
                <FiHash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-purple-500 focus:outline-none transition-all duration-300"
                  placeholder="STU12345"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <div className="relative group">
                <FiBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-purple-500 focus:outline-none transition-all duration-300"
                  placeholder="Computer Science"
                />
              </div>
            </div>
          </div>
          
          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Year of Study
            </label>
            <div className="relative group">
              <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-purple-500 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="2024">2024 - 1st Year</option>
                <option value="2025">2025 - 2nd Year</option>
                <option value="2026">2026 - 3rd Year</option>
                <option value="2027">2027 - 4th Year</option>
              </select>
            </div>
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 pr-12 focus:border-purple-500 focus:outline-none transition-all duration-300"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 pr-12 focus:border-purple-500 focus:outline-none transition-all duration-300"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          {/* Password Requirements */}
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-700 font-medium mb-1">Password Requirements:</p>
            <ul className="text-xs text-blue-600 space-y-0.5">
              <li>✓ Minimum 6 characters</li>
              <li>✓ At least one uppercase letter</li>
              <li>✓ At least one number</li>
            </ul>
          </div>
          
          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiUserPlus />
            {loading ? 'Creating account...' : 'Register'}
          </motion.button>
        </form>
        
        {/* Login Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
            Login here
          </Link>
        </p>
        
        {/* Terms */}
        <p className="text-center text-xs text-gray-400 mt-4">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;