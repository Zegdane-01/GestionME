import React, { useState } from 'react';
import api from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Alert } from '@mui/material';

const Login = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('personne/login/', { // Utilisez l'endpoint configuré dans vos URLs Django
        matricule: matricule,
        password: password,
      });

      const { access, refresh, user } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_role', user.role); // Stocker le rôle pour la gestion des permissions

      // Rediriger l'utilisateur en fonction de son rôle (exemple)
      if (user.role === 'N1') {
        navigate('/api/personne/personne');
      } else if (user.role === 'N2') {
        navigate('/n2');
      } else if (user.role === 'COLLABORATEUR') {
        navigate('/collaborateur');
      } else {
        navigate('/dashboard'); // Redirection par défaut
      }

    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.response && error.response.status === 401) {
        setError('Identifiants invalides.');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <h2>Se connecter</h2>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Matricule"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={matricule}
          onChange={(e) => setMatricule(e.target.value)}
        />
        <TextField
          label="Mot de passe"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Se connecter
        </Button>
      </form>
    </Container>
  );
};

export default Login;