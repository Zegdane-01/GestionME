import axios from 'axios';
import { logout } from '../services/auth';

const API_URL = 'http://localhost:8000/api/';
export const API_URL_MEDIA= 'http://localhost:8000/'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ——— Request interceptor ———
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // ou via Context/Redux
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gère les erreurs et le rafraîchissement automatique du token.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ▶︎  A.  Ne JAMAIS tenter de refresh pour ces endpoints publics
    const publicEndpoints = [
      'personne/login/',
      'token/refresh/',
      'token/logout/',
    ];
    if (publicEndpoints.some((ep) => originalRequest.url?.includes(ep))) {
      // on laisse l’erreur remonter au catch du composant
      return Promise.reject(error);
    }

    // ▶︎  B.  Reste du code inchangé …
    const isApiAuthError   = error.response?.status === 401;
    const isTokenNotValid  = error.response?.data?.code === 'token_not_valid';

    if ((isApiAuthError || isTokenNotValid) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          logout();
          window.location.href = '/login';
          return new Promise(() => {});
        }

        const response = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        return api(originalRequest);

      } catch (refreshError) {
        console.error("Impossible de rafraîchir le token, déconnexion.", refreshError);
        logout();
        window.location.href = '/login?sessionExpired=true';
        return new Promise(() => {});
      }
    }

    // Pour toutes les autres erreurs, on continue de les rejeter pour qu'elles puissent être gérées ailleurs.
    return Promise.reject(error);
  }
);


export const mediaApi = axios.create({
  baseURL: API_URL_MEDIA,
});

export default api;