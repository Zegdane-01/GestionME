// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { getUserRole, login } from '../../../services/auth';
import api from '../../../api/api';
import './Login.css';
import logo from '../../../assets/images/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { identifier, password } = formData;
      const response = await api.post('personne/login/', { identifier, password });
      const data = response.data;

      login(data.access, data.refresh, data.user); // ton service d'auth

      const userRole = getUserRole();
      if (userRole === 'TeamLead') {
        navigate('/dashboard');
      } else if (userRole === 'Collaborateur') {
        navigate('/formations');
      } else {
        navigate('/'); // fallback
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');

      if (error.response?.status === 401) {
        setError('Identifiant ou mot de passe incorrect.');
      } else {
        setError('Erreur de connexion. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <Container fluid className="login-container">
        <Card className="login-card">
          <Card.Body className="p-0">
            <Row>
              <Col md={6} className='text-center pt-4 position-relative'>
                <div className="background-image"></div>
                <img src={logo} alt="Expleo Logo" className="h-16 mb-4 hover:scale-105 transition-transform duration-300" />
                <h1 className="h1-title font-heading font-bold">Portail Manufacturing Engineering</h1>
                <p className="text-sm text-white mt-1">Connexion à votre espace de travail</p>
              </Col>

              <Col md={6} className='p-4'>
                <h2 className="login-title text-center mb-4">Connexion</h2>
                {error && <Alert variant="danger" className="error-alert">{error}</Alert>}

                <Form className="login-form" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Identifiant (matricule ou e-mail)</Form.Label>
                    <Form.Control
                      className="form-control"
                      placeholder="ex. E012345 ou john.doe@expleogroup.com"
                      type="text"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Mot de passe</Form.Label>
                    <div className="password-input-wrapper">
                      <Form.Control
                        className="form-control"
                        placeholder="Entrez votre mot de passe"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <span
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        role="button"
                        tabIndex={0}
                      >
                        {showPassword ? 'Cacher' : 'Afficher'}
                      </span>
                    </div>
                  </Form.Group>

                  <div className='text-center m-0'>
                    <Button className="login-button" variant="primary" type="submit" disabled={loading}>
                      {loading ? 'Chargement...' : 'Connexion'}
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </section>
  );
};

export default Login;
