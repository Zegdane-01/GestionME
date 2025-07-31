import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <AlertTriangle size={64} className="text-warning mb-4" />
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#475569' }}>Page Introuvable</h2>
      <p style={{ color: '#64748b', marginTop: '1rem' }}>
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link 
        to="/" 
        style={{
          marginTop: '2rem',
          padding: '10px 20px',
          backgroundColor: '#6366f1',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px'
        }}
      >
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFound;