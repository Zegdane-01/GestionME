import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Composants réutilisables du projet
import SearchBar from '../../../components/Personne_Projet/SearchBar';
import TrainingTable from '../../../components/Training/CRUD/TrainingTable';
import DeleteTrainingModal from '../../../components/Training/CRUD/DeleteTrainingModal';
// Feuille de styles commune
import styles from '../../../assets/styles/List.module.css';

// Icônes
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// API
import api from '../../../api/api';

const TrainingListManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTrainings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/formations/');
      setTrainings(response.data);
      setFilteredTrainings(response.data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des formations.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    const results = trainings.filter(training =>
      training.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.domain_info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.created_by_info.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.created_by_info.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTrainings(results);
  }, [searchTerm, trainings]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };


  const handleDeleteConfirm = (id) => {
    setTrainingToDelete(id);
    setShowDeleteModal(true);
  };

  const deleteTraining = async () => {
    if (trainingToDelete) {
      try {
        await api.delete(`/formations/${trainingToDelete}/`);
        setTrainings(trainings.filter(t => t.id !== trainingToDelete));
        toast.success("Formation supprimée avec succès !");
      } catch (error) {
        toast.error("Erreur lors de la suppression !");
        console.error(error);
      } finally {
        setShowDeleteModal(false);
        setTrainingToDelete(null);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/manager/trainings/edit/${id}`);
  };

  const handleAdd = () => {
    navigate('/manager/trainings/add/');
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Formations</h1>
        <button className={styles.addButton} onClick={handleAdd}>
          <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
          <span>Nouvelle Formation</span>
        </button>
      </div>

      <div className={styles.searchContainer}>
        <SearchBar value={searchTerm} onChange={handleSearch} placeholder="Rechercher par titre, domaine, Créateur..." />
        <div className={styles.searchStats}>
          {filteredTrainings.length} formation{filteredTrainings.length !== 1 ? 's' : ''} trouvée{filteredTrainings.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.contentContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement des formations...</p>
          </div>
        ) : (
          <TrainingTable
            trainings={filteredTrainings}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        )}
      </div>

      <DeleteTrainingModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={deleteTraining}
      />
    </div>
  );
};

export default TrainingListManager;
