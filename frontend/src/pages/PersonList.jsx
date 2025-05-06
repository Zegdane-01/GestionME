import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import SearchBar from '../components/Personne/CRUD/SearchBar';
import PersonTable from '../components/Personne/CRUD/PersonneTable';
import ViewPersonModal from '../components/Personne/CRUD/ViewPersonneModal';
import DeletePersonModal from '../components/Personne/CRUD/DeletePersonneModal';
import '../assets/styles/PersonList.css'; 
import api from '../api/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const PersonList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const navigate = useNavigate();


  const fetchPeople = async () => {
    try {
      const response = await api.get('/personne/personnes/');
      setPeople(response.data);
    } catch (error) {
      /*toast.error(`Erreur lors de la récupération des personnes: ${error.message}`);*/
      console.error("Erreur de récupération des personnes:", error);
    }
  };
  
  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    const results = people.filter(person =>
      person.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPeople(results);
  }, [searchTerm, people]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleView = (person) => {
    setSelectedPerson(person);
    setShowViewModal(true);
  };

  const handleDeleteConfirm = (matricule) => {
    setPersonToDelete(matricule);
    setShowDeleteModal(true);
  };

  const deletePerson = async () => {
    if (personToDelete) {
      try {
        await api.delete(`/api/personne/personnes/${personToDelete}/`);
        setPeople(people.filter(person => person.matricule !== personToDelete));
        /*toast.success("La personne a été supprimée avec succès");*/
      } catch (error) {
        /*toast.error(`Erreur lors de la suppression de la personne: ${error.message}`);*/
        console.error("Erreur de suppression de la personne:", error);
      } finally {
        setShowDeleteModal(false);
        setPersonToDelete(null);
      }
    }
  };

  const handleEdit = (matricule) => {
    navigate(`/person/edit/${matricule}`);
  };

  const handleAdd = () => {
    navigate('/person/add');
  };

  return (
    <Container fluid className="person-list-container"> 
      <Card className="mt-3 custom-card">
        <Card.Header className="custom-card-header d-flex justify-content-between align-items-center rounded-top-4">
          <h2 className="person-list-title">Liste des Collaborateurs</h2> 
          <Button variant="primary" size="sm" onClick={handleAdd} className="custom-primary-btn align-items-center">
            <FontAwesomeIcon icon={faPlus} className="me-1" size="sm" />
            Ajouter
          </Button>
        </Card.Header>
        <Card.Body className="person-list-body"> 
          <Row className="person-list-search-row mb-3"> 
            <Col md={6} className="person-list-search-col"> 
              <SearchBar value={searchTerm} onChange={handleSearch} placeholder="Rechercher par nom, matricule, email..." />
            </Col>
          </Row>
          <PersonTable
            people={filteredPeople}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        </Card.Body>
      </Card>

      {/* Modals */}
      <ViewPersonModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        person={selectedPerson}
      />

      <DeletePersonModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={deletePerson}
      />
    </Container>
  );
};

export default PersonList;
