import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import api from '../../../api/api';
import Navbar from '../../Public/Navbar/Navbar';
import './Login.css'
import logo from '../../../assets/images/logo.png'

const Login = () => {
  const [formData, setFormData] = useState({ matricule: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Ajout de l'état loading
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response  = await api.post('personne/login/', {
        matricule: formData.matricule,
        password: formData.password,
      });
      const data = response.data; // Récupération des données de la réponse
      // Gestion de la réponse
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('isManager', data.is_manager);
      
      if (data.is_manager) {
        localStorage.setItem('managerData', JSON.stringify(data.manager));
        // Rediriger l'utilisateur en fonction de son rôle (exemple)
        if (data.manager.role === 'N1') {
          navigate('/n1');
        } else if (data.manager.role === 'N2') {
          navigate('/n2');
        }
      } else {
        localStorage.setItem('userData', JSON.stringify(data.user));
          // Rediriger l'utilisateur en fonction de son rôle (exemple)
        navigate('/collaborateur');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.response && error.status === 401) {
        setError('Identifiants invalides.');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
      setLoading(false); // Remettre loading à false en cas d'erreur
    }
  };

 // Ajouter ces modifications dans votre JSX
return (
  <section>
      <Navbar />
        <Container fluid className="login-container">
            <Card className="login-card ">
                <Card.Body className="p-0">
                  <Row>
                  <Col md={6} className='text-center pt-4 position-relative'>
                    <div className="background-image"></div>
                    <img
                      src={logo}
                      alt="Expleo Logo"
                      className="h-16 mb-4 hover:scale-105 transition-transform duration-300"
                    />
                    <h1 className="h1-title font-heading font-bold">
                      Portail Manufacturing Engineering
                    </h1>
                    <p className="text-sm text-white mt-1">
                      Connexion à votre espace de travail
                    </p>
                  </Col>
                  
                  <Col md={6} className='p-4'>
                    <h2 className="login-title text-center mb-4">Connexion</h2>
                    {error && <Alert variant="danger" className="error-alert">{error}</Alert>}

                    <Form
                    className="login-form"
                    onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Matricule</Form.Label>
                        <Form.Control
                          className="form-control"
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
                          className="form-control" 
                          placeholder="Entrez votre mot de passe"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                      </Form.Group>
                      <div className='text-center m-0'>
                      <Button
                        className="login-button"
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                      >
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