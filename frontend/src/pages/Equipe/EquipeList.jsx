import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SearchBar from '../../components/Personne_Projet/SearchBar';
import EquipeTable from '../../components/Equipe/CRUD/EquipeTable';
import ViewEquipeModal from '../../components/Equipe/CRUD/ViewEquipeModal';
import DeleteEquipeModal from '../../components/Equipe/CRUD/DeleteEquipeModal';
import DomainManagerModal from '../../components/Equipe/CRUD/Domain/DomainManagerModal';
import styles from '../../assets/styles/List.module.css';
import api from '../../api/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const EquipeList = () => {
  const [modalOpen, setModalOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [equipes, setEquipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEquipes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/equipes/');
      setEquipes(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error("Erreur de récupération des activités");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipes();
  }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFiltered(
      equipes.filter(e =>
        e.name.toLowerCase().includes(low)
      )
    );
  }, [searchTerm, equipes]);

  const handleSearch = e => setSearchTerm(e.target.value);
  const handleView = equipe => { setSelected(equipe); setShowView(true); };
  const handleDeleteConfirm = equipe => { setToDelete(equipe); setShowDelete(true); };
  const handleEdit = id => navigate(`/activites/edit/${id}`);
  const handleAdd = () => navigate('/activites/add');

  const deleteEquipe = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/equipes/${toDelete.id}/`);
      setEquipes(equipes.filter(e => e.id !== toDelete.id));
      toast.success("Activité supprimée");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setShowDelete(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Activités</h1>
         <div className="d-flex justify-content-end gap-2">
            <button
              className={`${styles.addButton}`}
              onClick={() => setModalOpen(true)}
            >
              Gérer Domaines
            </button>
            <button className={styles.addButton} onClick={handleAdd}>
              <FontAwesomeIcon icon={faPlus} className={styles.addIcon} /> <span>Nouvelle Activité</span>
            </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Rechercher par nom d'actvité..."
        />
        <div className={styles.searchStats}>
          {filtered.length} activité{filtered.length !== 1 ? 's' : ''} trouvée
          {filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p>Chargement des équipes…</p>
          </div>
        ) : (
          <EquipeTable
            equipes={filtered}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        )}
      </div>

      <ViewEquipeModal
        show={showView}
        onHide={() => setShowView(false)}
        equipe={selected}
      />

      <DeleteEquipeModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={deleteEquipe}
        equipe={toDelete}
      />

      <DomainManagerModal show={modalOpen} onHide={() => setModalOpen(false)} />

    </div>
  );
};

export default EquipeList;
