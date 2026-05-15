import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      // For demo without backend, simulate API call
      // When backend is ready, uncomment the actual API call
      /*
      const response = await api.post('/auth/login', { email, password });
      return response.data;
      */
      
      // Demo response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            access_token: 'demo_token_' + Date.now(),
            token_type: 'bearer'
          });
        }, 500);
      });
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      // For demo without backend, simulate API call
      /*
      const response = await api.post('/auth/register', userData);
      return response.data;
      */
      
      // Demo response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Date.now(),
            email: userData.email,
            full_name: userData.full_name,
            role: 'student'
          });
        }, 500);
      });
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
};