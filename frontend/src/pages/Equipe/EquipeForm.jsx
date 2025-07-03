import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import api from "../../api/api";
import styles from '../../assets/styles/Form.module.css';
import ConfirmationModal from '../../components/Equipe/CRUD/ConfirmationModal.jsx';



const EquipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const [userSearch, setUserSearch] = useState(''); 
  const [searchDomain, setSearchDomain] = useState('');
  const [allDomains, setAllDomains] = useState([]);
  const [available, setAvailable] = useState([]); // utilisateurs disponibles
  const [allEquipes,   setAllEquipes]   = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    assigned_users: [],   // collaborateurs cochés
    domains: [],          // <-- nouveaux IDs de domaines cochés
  });

  const [searchResults, setSearchResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState({ isOpen: false, user: null, fromTeamName: '' });
  const [removeModalState, setRemoveModalState] = useState({ isOpen: false, user: null });

  const [domainSearchResults, setDomainSearchResults] = useState([]);
  const [removeDomainModal, setRemoveDomainModal] = useState({ isOpen: false, domain: null });


  
  const getAvailableUsers = (users, currentTeamId) =>
    users.filter(u =>
      // l'API doit renvoyer u.equipes = [id, …] ou []
      !u.equipes ||                              // aucun rattachement
      u.equipes.length === 0 ||
      (currentTeamId && u.equipes.includes(Number(currentTeamId)))  // déjà dans l’équipe en cours d’édition
    );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom de l'activité est requis.";
    return newErrors;
  };

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, equipesRes, domainsRes] = await Promise.all([
          api.get('/personne/personnes/'),
          api.get('/equipes/'),
          api.get('/domains/')
        ]);

        setAllUsers(usersRes.data);
        setAllEquipes(equipesRes.data);
        setAllDomains(domainsRes.data);

        if (isEditMode) {
          const team = await api.get(`/equipes/${id}/`);
          setFormData({
            name:            team.data.name,
            assigned_users:  team.data.assigned_users || [],
            domains:         team.data.domains_info.map(d => d.id.toString()),
          });
        }
      } catch (err) {
        toast.error("Erreur lors du chargement des données.");
        console.error(err);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  useEffect(() => {
    if (allUsers.length === 0) return;

    /* --- matricules déjà pris dans d’autres équipes --- */
    const busy = new Set();
    allEquipes.forEach(eq => {
      (eq.assigned_users || []).forEach(matricule => busy.add(matricule));
    });

    /* --- matricules déjà dans l’équipe qu’on édite (autorisé) --- */
    const current = new Set();
    if (isEditMode) {
      const cur = allEquipes.find(e => e.id === Number(id));
      cur?.assigned_users?.forEach(m => current.add(m));
    }

    /* --- filtrage final --- */
    const free = allUsers.filter(u =>
      !busy.has(u.matricule) || current.has(u.matricule)
    );

    setAvailable(free);
  }, [allUsers, allEquipes, id, isEditMode]);

  const filteredUsers = available.filter(user =>
    `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(userSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    const payload = {
      ...formData,
      name: formData.name,
      assigned_users: formData.assigned_users,
      domains: formData.domains.map(id => Number(id))
    };

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        if (isEditMode) {
          await api.put(`/equipes/${id}/`, payload);
          toast.success("Activité mise à jour avec succès");
        } else {
          await api.post(`/equipes/`, payload);
          toast.success("Activité créée avec succès");
        }
        navigate('/activites');
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de l'enregistrement.");
      } finally {
        setLoading(false);
      }
    }
  };

  const userTeamMap = useMemo(() => {
    const map = new Map();
    allEquipes.forEach(equipe => {
      // On ignore l'équipe en cours d'édition
      if (isEditMode && equipe.id === Number(id)) return;
      
      equipe.assigned_users.forEach(matricule => {
        map.set(matricule, equipe.name);
      });
    });
    return map;
  }, [allEquipes, id, isEditMode]);

  const assignedUsersDetails = useMemo(() => {
    if (allUsers.length === 0) return [];
    
    // Crée une Map pour une recherche rapide des détails de l'utilisateur par matricule
    const userMap = new Map(allUsers.map(user => [user.matricule, user]));
    
    // Pour chaque matricule assigné, on récupère l'objet utilisateur complet
    return formData.assigned_users
      .map(matricule => userMap.get(matricule))
      .filter(Boolean); // filter(Boolean) retire les éventuels résultats 'undefined'
  }, [formData.assigned_users, allUsers]);

  const assignedDomainsDetails = useMemo(() => {
    if (allDomains.length === 0) return [];
    const domainMap = new Map(allDomains.map(d => [d.id.toString(), d]));
    return formData.domains.map(domainId => domainMap.get(domainId)).filter(Boolean);
  }, [formData.domains, allDomains]);

  useEffect(() => {
    if (searchDomain.trim() === '') {
      setDomainSearchResults([]);
      return;
    }
    const results = allDomains.filter(domain => 
      domain.name.toLowerCase().includes(searchDomain.toLowerCase()) &&
      !formData.domains.includes(domain.id.toString())
    );
    setDomainSearchResults(results);
  }, [searchDomain, allDomains, formData.domains]);
  

  const handleAddUser = (user) => {
    setFormData(prev => ({
      ...prev,
      assigned_users: [...prev.assigned_users, user.matricule],
    }));
    // Vider la recherche après ajout
    setUserSearch('');
    setSearchResults([]);
  };

  const promptRemoveUser = (user) => {
    setRemoveModalState({ isOpen: true, user: user });
  };

  const handleRemoveUser = (matriculeToRemove) => {
    setFormData(prev => ({
      ...prev,
      assigned_users: prev.assigned_users.filter(id => id !== matriculeToRemove),
    }));
  };

  useEffect(() => {
    if (userSearch.trim() === '') {
      setSearchResults([]);
      return;
    }

    const searchResults = allUsers.filter(user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      // On n'affiche pas les utilisateurs déjà dans la sélection actuelle
      const isAlreadyAssigned = formData.assigned_users.includes(user.matricule);
      return fullName.includes(userSearch.toLowerCase()) && !isAlreadyAssigned;
    });

    setSearchResults(searchResults);
  }, [userSearch, allUsers, formData.assigned_users]);
  
  const handleConfirmRemoveUser = () => {
    if (removeModalState.user) {
      setFormData(prev => ({
        ...prev,
        assigned_users: prev.assigned_users.filter(id => id !== removeModalState.user.matricule),
      }));
      toast.success(`${removeModalState.user.first_name} a été retiré de l'équipe.`);
    }
    // On ferme la modale
    setRemoveModalState({ isOpen: false, user: null });
  };

  const handleSelectUserFromSearch = (user) => {
    const fromTeamName = userTeamMap.get(user.matricule);

    if (fromTeamName) {
      // L'utilisateur est déjà dans une autre équipe -> ouvrir la modale
      setModalState({ isOpen: true, user, fromTeamName });
    } else {
      // L'utilisateur est libre -> l'ajouter directement
      handleAddUser(user);
    }
  };

  const handleConfirmMoveUser = () => {
    if (modalState.user) {
      handleAddUser(modalState.user);
    }
    // Fermer la modale
    setModalState({ isOpen: false, user: null, fromTeamName: '' });
  };

  const handleAddDomain = (domain) => {
    setFormData(prev => ({
      ...prev,
      domains: [...prev.domains, domain.id.toString()],
    }));
    setSearchDomain('');
    setDomainSearchResults([]);
  };

  const handleRemoveDomain = (domain) => {
    setRemoveDomainModal({ isOpen: true, domain });
  };
  
  const handleConfirmRemoveDomain = () => {
    if (removeDomainModal.domain) {
      setFormData(prev => ({
        ...prev,
        domains: prev.domains.filter(id => id !== removeDomainModal.domain.id.toString()),
      }));
      toast.success(`Le domaine "${removeDomainModal.domain.name}" a été retiré.`);
    }
    setRemoveDomainModal({ isOpen: false, domain: null });
  };

  return (
    <>
    <div className="container py-5">
      <h1 className={`${styles.formTitle} mb-5 text-center`}>
        {isEditMode ? 'Modifier une activité' : 'Créer une nouvelle activité'}
      </h1>

      <form onSubmit={handleSubmit} className={styles.projetFormCard}>
        <div className="row g-4 mb-4">
          <div className="col-md-12">
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Nom de l'équipe <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.name ? styles.inputError : ''}`}
              />
              {errors.name && <p className={styles.errorText}>{errors.name}</p>}
            </div>
          </div>

          <div className="col-md-12">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Membres sélectionnés ({assignedUsersDetails.length})</label>
              <div className={styles.assignedListContainer}>
                {assignedUsersDetails.length > 0 ? (
                  assignedUsersDetails.map(user => (
                    <div key={user.matricule} className={styles.assignedUserRow}>
                      <span>{user.first_name} {user.last_name}</span>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => promptRemoveUser(user)}
                        title={`Retirer ${user.first_name}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small m-2">Aucun membre sélectionné pour le moment.</p>
                )}
              </div>
            </div>

            {/* Section pour AJOUTER des membres */}
            <div className={`${styles.formGroup} mt-4`}>
              <label htmlFor="userSearch" className={styles.formLabel}>Ajouter un membre</label>
              <input
                type="text"
                id="userSearch"
                placeholder="Rechercher par nom pour ajouter un membre..."
                className={styles.formControl}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {/* Affichage des résultats de recherche */}
              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map(user => (
                    <div
                      key={user.matricule}
                      className={styles.searchResultItem}
                      onClick={() => handleSelectUserFromSearch(user)}
                    >
                      {user.first_name} {user.last_name}
                      {userTeamMap.has(user.matricule) && (
                        <small className="text-muted ms-2">
                          (Actuellement dans l'équipe "{userTeamMap.get(user.matricule)}")
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-12">
            {/* Affichage des domaines sélectionnés */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Domaines associés ({assignedDomainsDetails.length})</label>
              <div className={styles.assignedListContainer}>
                {assignedDomainsDetails.map(domain => (
                  <div key={domain.id} className={styles.assignedItemRow}>
                    <span>{domain.name}</span>
                    <button type="button" className={styles.removeButton} onClick={() => handleRemoveDomain(domain)} title={`Retirer ${domain.name}`}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {assignedDomainsDetails.length === 0 && <p className="text-muted small m-2">Aucun domaine associé.</p>}
              </div>
            </div>
            {/* Ajout de domaines via recherche */}
            <div className={`${styles.formGroup} mt-4`}>
              <label htmlFor="domainSearch" className={styles.formLabel}>Associer un domaine</label>
              <input
                type="text"
                id="domainSearch"
                placeholder="Rechercher par nom pour associer un domaine..."
                className={styles.formControl}
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
              />
              {domainSearchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {domainSearchResults.map(domain => (
                    <div
                      key={domain.id}
                      className={styles.searchResultItem}
                      onClick={() => handleAddDomain(domain)}
                    >
                      {domain.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


        </div>

        <div className={`${styles.buttonGroup} d-flex justify-content-end`}>
          <button
            type="button"
            onClick={() => navigate('/activites')}
            className={`${styles.actionButton} ${styles.cancelButton} me-3`}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`${styles.actionButton} ${styles.submitButton}`}
          >
            {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
    <ConfirmationModal
      isOpen={modalState.isOpen}
      onClose={() => setModalState({ isOpen: false, user: null, fromTeamName: '' })}
      onConfirm={handleConfirmMoveUser}
      title="Confirmation de changement d'équipe"
    >
      <p>
        L'utilisateur <strong>{modalState.user?.first_name} {modalState.user?.last_name}</strong> est déjà assigné à l'équipe "<strong>{modalState.fromTeamName}</strong>".
      </p>
      <p>
        Voulez-vous le retirer de son équipe actuelle et l'ajouter à cette nouvelle équipe ?
      </p>
    </ConfirmationModal>
    <ConfirmationModal
        isOpen={removeModalState.isOpen}
        onClose={() => setRemoveModalState({ isOpen: false, user: null })}
        onConfirm={handleConfirmRemoveUser}
        title="Confirmation de suppression"
      >
        <p>
          Êtes-vous sûr de vouloir retirer <strong>{removeModalState.user?.first_name} {removeModalState.user?.last_name}</strong> de cette équipe ?
        </p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={removeDomainModal.isOpen}
        onClose={() => setRemoveDomainModal({ isOpen: false, domain: null })}
        onConfirm={handleConfirmRemoveDomain}
        title="Confirmation de suppression"
      >
        <p>Êtes-vous sûr de vouloir retirer le domaine <strong>{removeDomainModal.domain?.name}</strong> de cette équipe ?</p>
      </ConfirmationModal>
    </>
  );
};

export default EquipeForm;
