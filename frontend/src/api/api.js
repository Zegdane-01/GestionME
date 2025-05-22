import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';
export const API_URL_MEDIA= 'http://localhost:8000/'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mediaApi = axios.create({
  baseURL: API_URL_MEDIA,
});

export default api;