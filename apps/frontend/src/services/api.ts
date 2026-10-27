import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const caseAPI = {
  getCases: () => api.get('/cases'),
  createCase: (data: any) => api.post('/cases', data),
};

export const deadlineAPI = {
  calculate: (data: any) => api.post('/deadlines/calculate', data),
  getDeadlines: (caseId: number) => api.get(`/deadlines/cases/${caseId}/deadlines`),
};
