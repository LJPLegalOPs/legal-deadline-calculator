import axios from 'axios';

const API_BASE = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email: string, password: string, firmName?: string) =>
    api.post('/auth/register', { email, password, firmName }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const caseAPI = {
  createCase: (data: any) => api.post('/cases', data),
  getCases: () => api.get('/cases'),
  getCase: (id: number) => api.get(`/cases/${id}`),
};

export const deadlineAPI = {
  calculate: (data: any) => api.post('/calculate', data),
  getDeadlines: (caseId: number) => api.get(`/cases/${caseId}/deadlines`),
};

export default api;
