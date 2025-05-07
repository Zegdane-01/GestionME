import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import {toast} from 'react-hot-toast';
import "../assets/styles/PersonForm.css"
import api from "../api/api"

const PersonForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    matricule: '',
    password: '',
    confirmPassword: '', 
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    sexe: '',
    dt_Embauche: '',
    position: '',
    role: 'COLLABORATEUR',
    cv: null,
    photo: null,
    I_E: '',
    status: '',
  });

  useEffect(() => {
    if (isEditMode) {
      api.get(`/personnes/${id}/`)
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

    if (!isEditMode && formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    const requiredFields = ['matricule', 'first_name', 'last_name', 'email', 'telephone', 'sexe', 'dt_Embauche', 'position', 'I_E', 'status'];
    for (let feild of requiredFields) {
      if (!formData[feild]) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
    }

    const payload = { ...formData };
    // Ensure role is always the default when creating
    if (!isEditMode) {
      payload.role = "COLLABORATEUR";
      delete payload.confirmPassword; // Remove confirmPassword from payload
    } else {
      delete payload.confirmPassword; // Remove confirmPassword from payload
    }


    const formPayload = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null) formPayload.append(key, value);
    });

    try {

      if (isEditMode) {
        await api.put(`/personnes/${id}/`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`${formData.first_name} ${formData.last_name} a été mis à jour`);
      } else {
        await api.post(`/personne/personnes/`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`${formData.first_name} ${formData.last_name} a été ajouté`);
      }

      navigate('/personnes');
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = error.response.data;
        if (errors.matricule?.[0]) {
          toast.error("Ce matricule existe déjà !");
        } else {
          toast.error("Erreur lors de l'envoi du formulaire.");
        }
      } else {
        toast.error("Une erreur est survenue");
      }
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Container className="py-4 flex-grow-1">
        <Card className="mx-auto" style={{ maxWidth: '900px' }}>
          <Card.Header>
            <h2 className="h3 fw-bold mb-0">
              {isEditMode ? 'Modifier un collaborateur' : 'Ajouter un collaborateur'}
            </h2>
          </Card.Header>
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Card.Body className="py-4">

            <h5 className="mb-3 fw-semibold">Informations personnelles</h5>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Prénom <span className='text-danger'>*</span></Form.Label>
                    <Form.Control name="first_name" value={formData.first_name} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom <span className='text-danger'>*</span></Form.Label>
                    <Form.Control name="last_name" value={formData.last_name} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email <span className='text-danger'>*</span></Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Téléphone <span className='text-danger'>*</span></Form.Label>
                    <Form.Control name="telephone" value={formData.telephone} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Sexe <span className='text-danger'>*</span></Form.Label>
                    <Form.Select name="sexe" value={formData.sexe} onChange={handleChange} required>
                      <option value="">-- Choisir --</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mb-3 fw-semibold">Informations d'identification</h5>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Matricule <span className='text-danger'>*</span></Form.Label>
                    <Form.Control name="matricule" value={formData.matricule} onChange={handleChange} required disabled={isEditMode} />
                  </Form.Group>
                </Col>
              </Row>
                {!isEditMode && (
                  <Row className='g-3 mb-3'>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Mot de passe <span className='text-danger'>*</span></Form.Label>
                        <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Confirmer le mot de passe <span className='text-danger'>*</span></Form.Label>
                        <Form.Control type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

              <h5 className="mb-3 fw-semibold">Informations professionnelles</h5>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date d'embauche <span className='text-danger'>*</span></Form.Label>
                    <Form.Control type="date" name="dt_Embauche" value={formData.dt_Embauche} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Position <span className='text-danger'>*</span></Form.Label>
                    <Form.Control name="position" value={formData.position} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Type <span className='text-danger'>*</span></Form.Label>
                    <Form.Select name="I_E" value={formData.I_E} onChange={handleChange} required>
                      <option value="">-- Choisir --</option>
                      <option value="Intern">Intern</option>
                      <option value="Extern">Extern</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status <span className='text-danger'>*</span></Form.Label>
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
              </Row>

              <h5 className="mb-3 fw-semibold">Documents</h5>
              <Row className="g-3">
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
              <Button variant="secondary" onClick={() => navigate('/personnes')}>Annuler</Button>
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