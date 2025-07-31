import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/auth';

/**
 * Ce composant protège les routes en fonction du rôle de l'utilisateur.
 * @param {object} props
 * @param {string[]} props.allowedRoles - Un tableau des rôles autorisés (ex: ['TL1', 'TL2'])
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  // 1. Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion.
  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  // 2. Si l'utilisateur est connecté mais que son rôle n'est pas dans la liste des rôles autorisés...
  if (!allowedRoles.includes(userRole)) {
    // ...on le redirige vers une page "accès non autorisé".
    return <Navigate to="/unauthorized" />;
  }

  // 3. Si tout est en ordre, on affiche la page demandée.
  return <Outlet />;
};

export default ProtectedRoute;