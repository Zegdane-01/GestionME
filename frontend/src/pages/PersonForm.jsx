import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from "sonner";
import axios from 'axios';

const PersonForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    matricule: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    sexe: '',
    dt_Embauche: '',
    position: '',
    role: '',
    cv: null,
    photo: null,
    I_E: '',
    status: '',
  });

  useEffect(() => {
    if (isEditMode) {
      axios.get(`/api/personnes/${id}/`)
        .then((res) => setFormData(res.data))
        .catch(() => {
          toast.error("Personne non trouvée");
          navigate('/personnes');
        });
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['matricule', 'first_name', 'last_name', 'email', 'telephone', 'sexe', 'dt_Embauche', 'position', 'role', 'I_E', 'status'];
    for (let feild of requiredFields) {
      if (!formData[feild]) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
    }

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) formPayload.append(key, value);
      });
      
      if (isEditMode) {
        await axios.put(`/api/personnes/${id}/`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`${formData.first_name} ${formData.last_name} a été mis à jour`);
      } else {
        await axios.post(`/api/personnes/`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`${formData.first_name} ${formData.last_name} a été ajouté`);
      }

      navigate('/personnes');
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Container className="py-4 flex-grow-1">
        <Card className="mx-auto" style={{ maxWidth: '900px' }}>
          <Card.Header>
            <h2 className="h3 fw-bold mb-0">
              {isEditMode ? 'Modifier une personne' : 'Ajouter une personne'}
            </h2>
          </Card.Header>
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Matricule *</Form.Label>
                    <Form.Control name="matricule" value={formData.matricule} onChange={handleChange} required disabled={isEditMode} />
                  </Form.Group>
                </Col>
                {!isEditMode && (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Mot de passe *</Form.Label>
                      <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                )}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Prénom *</Form.Label>
                    <Form.Control name="first_name" value={formData.first_name} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom *</Form.Label>
                    <Form.Control name="last_name" value={formData.last_name} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email *</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Téléphone *</Form.Label>
                    <Form.Control name="telephone" value={formData.telephone} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Sexe *</Form.Label>
                    <Form.Select name="sexe" value={formData.sexe} onChange={handleChange} required>
                      <option value="">-- Choisir --</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date d'embauche *</Form.Label>
                    <Form.Control type="date" name="dt_Embauche" value={formData.dt_Embauche} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Poste *</Form.Label>
                    <Form.Control name="position" value={formData.position} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Rôle *</Form.Label>
                    <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                      <option value="">-- Choisir --</option>
                      <option value="N1">Team Leader N1</option>
                      <option value="N2">Team Leader N2</option>
                      <option value="COLLABORATEUR">Collaborateur</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Type *</Form.Label>
                    <Form.Select name="I_E" value={formData.I_E} onChange={handleChange} required>
                      <option value="">-- Choisir --</option>
                      <option value="Intern">Intern</option>
                      <option value="Extern">Extern</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status *</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                      <option value="">-- Choisir --</option>
                      <option value="En formation">En formation</option>
                      <option value="En cours">En cours</option>
                      <option value="Bench">Bench</option>
                      <option value="Out">Out</option>
                      <option value="Management">Management</option>
                      <option value="Stage">Stage</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Photo</Form.Label>
                    <Form.Control type="file" name="photo" onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>CV</Form.Label>
                    <Form.Control type="file" name="cv" onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate('/persons')}>Annuler</Button>
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