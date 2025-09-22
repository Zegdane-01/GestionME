import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SearchBar from '../../components/Personne_Projet/SearchBar';
import ProjetTable from '../../components/Projet/CRUD/ProjetTable';
import ViewProjetModal from '../../components/Projet/CRUD/ViewProjetModal';
import DeleteProjetModal from '../../components/Projet/CRUD/DeleteProjetModal';
import styles from '../../assets/styles/List.module.css';
import api from '../../api/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const ProjetList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projets, setProjets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projet/projets/');
      setProjets(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error("Erreur de récupération des projets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjets();
  }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFiltered(
      projets.filter(p =>
        p.nom.toLowerCase().includes(low) ||
        p.ordre_travail.toLowerCase().includes(low) ||
        p.final_client.toLowerCase().includes(low) ||
        p.statut.toLowerCase().includes(low)
      )
    );
  }, [searchTerm, projets]);

  const handleSearch = e => setSearchTerm(e.target.value);
  const handleView = projet => { setSelected(projet); setShowView(true); };
  const handleDeleteConfirm = id => { setToDelete(id); setShowDelete(true); };
  const handleEdit = id => navigate(`/Projets/edit/${id}`);
  const handleAdd = () => navigate('/Projets/add');

  const deleteProjet = async () => {
    try {
      await api.delete(`/projet/projets/${toDelete}/`);
      setProjets(projets.filter(p => p.projet_id !== toDelete));
      toast.success("Projet supprimé");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setShowDelete(false);
    }
  };

  return (
    <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
            <h1 className={styles.dashboardTitle}>Projets</h1>
            <button className={styles.addButton} onClick={handleAdd}>
          <FontAwesomeIcon icon={faPlus} className={styles.addIcon} /> <span>Nouveau Projet</span>
        </button>
      </div>

      <div className={styles.searchContainer}>
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Rechercher par nom, code, client..."
        />
        <div className={styles.searchStats}>
          {filtered.length} projet{filtered.length !== 1 ? 's' : ''} trouvé
          {filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p>Chargement des projets…</p>
          </div>
        ) : (
          <ProjetTable
            projets={filtered}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        )}
      </div>

      <ViewProjetModal
        show={showView}
        onHide={() => setShowView(false)}
        projet={selected}
      />

      <DeleteProjetModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={deleteProjet}
      />
    </div>
  );
};

export default ProjetList;
