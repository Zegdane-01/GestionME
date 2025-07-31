import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Accès Non Autorisé</h1>
      <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
};

export default UnauthorizedPage;