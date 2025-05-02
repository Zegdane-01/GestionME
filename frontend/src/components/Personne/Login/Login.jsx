import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import api from '../../../api/api';

const Login = () => {
  const [formData, setFormData] = useState({ matricule: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Ajout de l'état loading
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('personne/login/', {
        matricule: formData.matricule,
        password: formData.password,
      });

      // Gestion de la réponse
      const { access, refresh, user } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_role', user.role);

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
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Card className="w-100" style={{ maxWidth: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Connexion</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Matricule</Form.Label>
              <Form.Control
                placeholder="Entrez votre matricule"
                type="text"
                value={formData.matricule}
                onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                placeholder="Entrez votre mot de passe"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Chargement...' : 'Connexion'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;