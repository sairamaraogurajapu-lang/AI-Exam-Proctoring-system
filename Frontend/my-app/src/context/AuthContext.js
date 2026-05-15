import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
    setIsLoading(false);
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      if (!password || password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return { success: false };
      }

      // Demo login - accepts any credentials
      const demoToken = `demo_token_${Date.now()}`;
      const role = email.includes('admin') ? 'admin' : 'student';
      const userData = {
        id: Date.now(),
        email,
        full_name: email.split('@')[0],
        role
      };

      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', role);
      
      setToken(demoToken);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      if (!userData.password || userData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return { success: false };
      }

      // Demo registration
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};