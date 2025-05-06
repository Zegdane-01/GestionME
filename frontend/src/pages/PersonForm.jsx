import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import Header from '@/components/Header';
import { toast } from "sonner";
import axios from 'axios';

const PersonForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    role: '',
    departement: '',
  });

  useEffect(() => {
    if (isEditMode) {
      axios.get(`/api/personnes/${id}/`)
        .then((res) => setFormData(res.data))
        .catch(() => {
          toast.error("Personne non trouvée");
          navigate('/persons');
        });
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.matricule || !formData.nom || !formData.prenom || !formData.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (isEditMode) {
        await axios.put(`/api/personnes/${id}/`, formData);
        toast.success(`${formData.prenom} ${formData.nom} a été mis à jour avec succès`);
      } else {
        await axios.post(`/api/personnes/`, formData);
        toast.success(`${formData.prenom} ${formData.nom} a été ajouté avec succès`);
      }

      navigate('/persons');
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header />
      <Container className="py-4 flex-grow-1">
        <Card className="mx-auto" style={{ maxWidth: '800px' }}>
          <Card.Header>
            <h2 className="h3 fw-bold mb-0">
              {isEditMode ? 'Modifier une personne' : 'Ajouter une personne'}
            </h2>
          </Card.Header>
          <Form onSubmit={handleSubmit}>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Matricule *</Form.Label>
                    <Form.Control
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom *</Form.Label>
                    <Form.Control
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Prénom *</Form.Label>
                    <Form.Control
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rôle</Form.Label>
                    <Form.Control
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Département</Form.Label>
                    <Form.Control
                      name="departement"
                      value={formData.departement}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-end gap-2">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/persons')}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                {isEditMode ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </Card.Footer>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default PersonForm;
