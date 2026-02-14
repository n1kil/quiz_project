import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Передаем токен с префиксом Bearer
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/register/', data),
  login: (data) => api.post('/login/', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const surveyAPI = {
  getAll: () => api.get('/surveys/'),
  getById: (id) => api.get(`/surveys/${id}/`),
  create: (data) => api.post('/surveys/', data),
  delete: (id) => api.delete(`/surveys/${id}/`),
};

export const quizAPI = {
  submit: (data) => api.post('/quiz/submit/', data),
  getMyResults: () => api.get('/quiz/my-results/'),
  getSurveyResults: (surveyId) => api.get(`/quiz/survey/${surveyId}/results/`),
};

export default api;