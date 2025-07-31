import { jwtDecode } from 'jwt-decode';
import api from '../api/api.js'; 

export const getAccessToken = () => localStorage.getItem('accessToken');

export const isTokenExpired = () => {
  const token = getAccessToken();
  if (!token) return true;

  try {
    const { exp } = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch {
    return true;
  }
};
// Vérifie uniquement si l'utilisateur est connecté
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('userData');
  return !!token && !!userData;
};

// Récupère le rôle "normalisé" de l'utilisateur
export const getUserRole = () => {
  try {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return null;
    
    const userData = JSON.parse(userDataString);
    if (!userData || !userData.role) return null;
    
    const rawRole = userData.role;
    
    if (['TL1', 'TL2', 'CL', 'UDL'].includes(rawRole)) {
      return 'TeamLead';
    } else if (rawRole === 'COLLABORATEUR') {
      return 'Collaborateur';
    }
    
    return rawRole; // autre cas si besoin
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    return null;
  }
};

export const getUserId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    // Suppose que le champ s’appelle `matricule`
    return userData.matricule || null;
  } catch {
    return null;
  }
};

/// Pour enregistrer les infos utilisateur après login
export const login = (token, refreshToken, userData) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userData', JSON.stringify(userData));
  
  // Déclencher un événement pour notifier les autres composants
  window.dispatchEvent(new Event('authChange'));
};
// Déconnexion
export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (refreshToken) {
    try {
      // On envoie le refresh token au serveur pour qu'il l'invalide
      await api.post('/token/logout/', {
        refresh: refreshToken,
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion sur le serveur:", error);
      // On continue la déconnexion côté client même si le serveur échoue
    }
  }

  // Nettoyage du localStorage (inchangé)
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  
  // Déclencher un événement pour notifier les autres composants (inchangé)
  window.dispatchEvent(new Event('authChange'));
};