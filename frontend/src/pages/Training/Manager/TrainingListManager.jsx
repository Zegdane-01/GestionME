import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// 🗂️ Données mock (pas d'appel API)
import { trainings as mockTrainings } from '../../../data/trainings';
// → si tu as des helpers (updateTrainingProgress, etc.) importe‑les aussi

// Composants réutilisables du projet
import SearchBar from '../../../components/Personne_Projet/SearchBar';
import TrainingTable from '../../../components/Training/CRUD/TrainingTable';
import ViewTrainingModal from '../../../components/Training/CRUD/ViewTrainingModal';
import DeleteTrainingModal from '../../../components/Training/CRUD/DeleteTrainingModal';
// Feuille de styles commune
import styles from '../../../assets/styles/List.module.css';

// Icônes
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const TrainingListManager = () => {
  const navigate = useNavigate();

  /* -------------------------------------------------- */
  /*                 STATES PRINCIPAUX                  */
  /* -------------------------------------------------- */
  const [searchTerm,        setSearchTerm]        = useState('');
  const [trainings,         setTrainings]         = useState([]);          // toutes les formations
  const [filteredTrainings, setFilteredTrainings] = useState([]);          // filtrées
  const [selectedTraining,  setSelectedTraining]  = useState(null);        // pour View
  const [showViewModal,     setShowViewModal]     = useState(false);
  const [showDeleteModal,   setShowDeleteModal]   = useState(false);
  const [trainingToDelete,  setTrainingToDelete]  = useState(null);
  const [isLoading,         setIsLoading]         = useState(true);

  /* -------------------------------------------------- */
  /*           CHARGEMENT INITIAL (mock data)           */
  /* -------------------------------------------------- */
  useEffect(() => {
    // Simuler un délai de chargement afin d'afficher le spinner
    const timer = setTimeout(() => {
      setTrainings([...mockTrainings]); // copie défensive
      setFilteredTrainings([...mockTrainings]);
      setIsLoading(false);
    }, 300); // 300 ms
    return () => clearTimeout(timer);
  }, []);

  /* -------------------------------------------------- */
  /*                  FILTRAGE RECHERCHE                */
  /* -------------------------------------------------- */
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = trainings.filter(t =>
      t.title.toLowerCase().includes(term) ||
      t.department.toLowerCase().includes(term) ||
      (t.createdBy || '').toLowerCase().includes(term)
    );
    setFilteredTrainings(results);
  }, [searchTerm, trainings]);

  const handleSearch = e => setSearchTerm(e.target.value);

  /* -------------------------------------------------- */
  /*                      ACTIONS CRUD                  */
  /* -------------------------------------------------- */
  const handleView = training => {
    setSelectedTraining(training);
    setShowViewModal(true);
  };

  const handleDeleteConfirm = id => {
    setTrainingToDelete(id);
    setShowDeleteModal(true);
  };

  const deleteTraining = () => {
    if (!trainingToDelete) return;

    // 🔸 Retirer la formation dans le state et dans le tableau mock
    const updatedList = trainings.filter(t => t.id !== trainingToDelete);
    setTrainings(updatedList);
    setFilteredTrainings(updatedList);

    // Facultatif : si tu veux refléter la suppression dans le tableau importé
    const idx = mockTrainings.findIndex(t => t.id === trainingToDelete);
    if (idx !== -1) mockTrainings.splice(idx, 1);

    toast.success('Formation supprimée avec succès');
    setShowDeleteModal(false);
    setTrainingToDelete(null);
  };

  const handleEdit = id => navigate(`/formations/edit/${id}`);
  const handleAdd  = () => navigate('/manager/trainings/add');

  /* -------------------------------------------------- */
  /*                        RENDER                      */
  /* -------------------------------------------------- */
  return (
    <div className={styles.dashboard}>
      {/* HEADER */}
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Formations</h1>
        <button className={styles.addButton} onClick={handleAdd}>
          <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
          <span>Nouvelle Formation</span>
        </button>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className={styles.searchContainer}>
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Rechercher par titre, département, créateur..."
        />
        <div className={styles.searchStats}>
          {filteredTrainings.length} formation{filteredTrainings.length !== 1 ? 's' : ''} trouvée{filteredTrainings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* TABLEAU OU SPINNER */}
      <div className={styles.contentContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement des formations...</p>
          </div>
        ) : (
          <TrainingTable
            trainings={filteredTrainings}
            onView={handleView}
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
