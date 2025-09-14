import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Chore services
export const getChores = () => api.get('/chores');
export const getChoreById = (id) => api.get(`/chores/${id}`);
export const createChore = (choreData) => api.post('/chores', choreData);

// Swap services
export const claimChore = (id) => api.post(`/chores/${id}/claim`);
export const completeChore = (id, proofData) => api.post(`/chores/${id}/complete`, proofData);
export const verifyChore = (id) => api.post(`/chores/${id}/verify`);

// User services
export const getMyProfile = () => api.get('/users/me');
export const getUserProfile = (id) => api.get(`/users/${id}`);
export const getMyPostedChores = () => api.get('/users/me/posted-chores');
export const getMyClaimedChores = () => api.get('/users/me/claimed-chores');


export default api;
