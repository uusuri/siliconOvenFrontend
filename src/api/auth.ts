import axios from 'axios';

export const API_URL = 'http://localhost:8081';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface SigninData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  username: string;
}

export const signup = (data: SignupData) => API.post('/auth/signup', data);
export const signin = (data: SigninData) => API.post<AuthResponse>('/auth/signin', data);

export default API;
