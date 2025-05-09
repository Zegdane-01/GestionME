import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SearchBar from '../components/Personne/CRUD/SearchBar';
import PersonTable from '../components/Personne/CRUD/PersonneTable';
import ViewPersonModal from '../components/Personne/CRUD/ViewPersonneModal';
import DeletePersonModal from '../components/Personne/CRUD/DeletePersonneModal';
import '../assets/styles/PersonList.css'; 
import api from '../api/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

const PersonList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/personne/personnes/');
      setPeople(response.data);
      setFilteredPeople(response.data);
    } catch (error) {
      toast.error("Erreur de récupération des personnes:", error);
    } finally {
      setIsLoading(false);
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
        await api.delete(`/personne/personnes/${personToDelete}/`);
        setPeople(people.filter(person => person.matricule !== personToDelete));
        toast.success("La personne a été supprimée avec succès");
      } catch (error) {
        toast.error(`Erreur lors de la suppression de la personne: ${error.message}`);
        console.error("Erreur de suppression de la personne:", error);
      } finally {
        setShowDeleteModal(false);
        setPersonToDelete(null);
      }
    }
  };

  const handleEdit = (matricule) => {
    navigate(`/collaborateurs/edit/${matricule}`);
  };

  const handleAdd = () => {
    navigate('/collaborateurs/add');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Collaborateurs</h1>
        <button className="add-button" onClick={handleAdd}>
          <FontAwesomeIcon icon={faPlus} className="add-icon" />
          <span>Nouveau Collaborateur</span>
        </button>
      </div>

      <div className="search-container">
      <SearchBar value={searchTerm} onChange={handleSearch} placeholder="Rechercher par nom, matricule, email..." />
        <div className="search-stats">
          {filteredPeople.length} collaborateur{filteredPeople.length !== 1 ? 's' : ''} trouvé{filteredPeople.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="content-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des collaborateurs...</p>
          </div>
        ) : (
          <PersonTable
            people={filteredPeople}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        )}
      </div>

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
    </div>
  );
};

export default PersonList;