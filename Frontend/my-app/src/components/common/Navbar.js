import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiHome } from 'react-icons/fi';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/student/dashboard" className="flex items-center gap-2">
            <FiHome className="text-blue-600 text-xl" />
            <span className="text-xl font-bold text-gray-800">AI Proctoring</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiUser className="text-gray-600" />
              <span className="text-gray-700">{user?.full_name || user?.email || 'Student'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;