import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SearchBar from '../components/Personne_Projet/SearchBar';
import PersonTable from '../components/Personne/CRUD/PersonneTable';
import ViewPersonModal from '../components/Personne/CRUD/ViewPersonneModal';
import ExcelImportModal from '../components/Personne/CRUD/ExcelImportModal';
import DeletePersonModal from '../components/Personne/CRUD/DeletePersonneModal';
import styles from '../assets/styles/List.module.css'; 
import api from '../api/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { Download, Upload } from 'lucide-react';

const PersonList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const modalWasOpenRef = useRef(false);

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
    // Cet effet se déclenche chaque fois que `showModal` change
    
    // On vérifie si la modale était ouverte (true) et est maintenant fermée (false)
    if (modalWasOpenRef.current && !showModal) {
      window.location.reload();
    }

    // On met à jour la référence avec l'état actuel pour la prochaine fois
    modalWasOpenRef.current = showModal;
  }, [showModal]);
  
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
      person.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.status.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get('/personne/download-latest-excel/', {
        responseType: 'blob', // pour gérer le fichier binaire
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Nom de fichier depuis le backend ou fallback
      const filename = response.headers['content-disposition']
        ?.split('filename=')[1]?.replace(/"/g, '') || 'dernier_plan_de_charge.xlsx';

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Aucun fichier disponible à télécharger.");
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Collaborateurs</h1>
        <div className="d-flex flex-column flex-sm-row gap-2 mt-3 mt-md-0">
          <button className={styles.addButton} onClick={() => setShowModal(true)}>
            <Upload className={styles.addIcon}/>
            <span>Importer le Plan de Charge</span>
          </button>
          <button className={styles.addButton} onClick={handleDownloadExcel}>
            <Download className={styles.addIcon} />
            <span>Télécharger le Plan de Charge</span>
          </button>
          <button className={styles.addButton} onClick={handleAdd}>
            <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
            <span>Nouveau Collaborateur</span>
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <SearchBar value={searchTerm} onChange={handleSearch} placeholder="Rechercher par nom, matricule, email..." />
        <div className={styles.searchStats}>
          {filteredPeople.length} collaborateur{filteredPeople.length !== 1 ? 's' : ''} trouvé{filteredPeople.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.contentContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
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

      <ExcelImportModal
       show={showModal}
       onHide={() => setShowModal(false)}
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