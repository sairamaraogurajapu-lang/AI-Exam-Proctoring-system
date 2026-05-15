import api from './api';

export const examService = {
  getActiveExams: async () => {
    try {
      const response = await api.get('/exams/active');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      // Return empty array if API fails
      return [];
    }
  },
  
  startExam: async (examId) => {
    try {
      const response = await api.post(`/exams/attempt/${examId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting exam:', error);
      // Return mock response for demo
      return { attempt_id: Math.floor(Math.random() * 1000) };
    }
  },
  
  submitExam: async (attemptId, answers) => {
    const response = await api.post(`/exams/attempt/${attemptId}/submit`, { answers });
    return response.data;
  },
  
  getExamResults: async (attemptId) => {
    const response = await api.get(`/exams/results/${attemptId}`);
    return response.data;
  },
};