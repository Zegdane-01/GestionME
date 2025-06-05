import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from "../../api/api";
import styles from '../../assets/styles/Form.module.css';



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

  const [errors, setErrors] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAvailableUsers = (users, currentTeamId) =>
    users.filter(u =>
      // l'API doit renvoyer u.equipes = [id, …] ou []
      !u.equipes ||                              // aucun rattachement
      u.equipes.length === 0 ||
      (currentTeamId && u.equipes.includes(Number(currentTeamId)))  // déjà dans l’équipe en cours d’édition
    );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom de l'équipe est requis.";
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
          toast.success("Équipe mise à jour avec succès");
        } else {
          await api.post(`/equipes/`, payload);
          toast.success("Équipe créée avec succès");
        }
        navigate('/equipes');
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de l'enregistrement.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container py-5">
      <h1 className={`${styles.formTitle} mb-5 text-center`}>
        {isEditMode ? 'Modifier une équipe' : 'Créer une nouvelle équipe'}
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
            <label className={styles.formLabel}>Membres assignés</label>
            <input
                type="text"
                placeholder="Rechercher un membre..."
                className={styles.formControl}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
            />
            <div className={styles.checkboxGrid}>
                {filteredUsers.map(user => (
                <label key={user.matricule} className={styles.checkboxItem}>
                    <input
                    type="checkbox"
                    value={user.matricule}
                    checked={formData.assigned_users.includes(user.matricule)}
                    onChange={(e) => {
                        const value = user.matricule;
                        setFormData(prev => ({
                        ...prev,
                        assigned_users: e.target.checked
                            ? [...prev.assigned_users, value]
                            : prev.assigned_users.filter(id => id !== value)
                        }));
                    }}
                    />
                    {user.first_name} {user.last_name}
                </label>
                ))}
            </div>
            </div>

          </div>

          <div className="col-md-12">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Domaines associés</label>
              <input
                type="text"
                placeholder="Rechercher un domaine..."
                className={styles.formControl}
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value.toLowerCase())}
              />
              <div className={styles.checkboxGrid}>
                {allDomains
                  .filter(domain =>
                    domain.name.toLowerCase().includes(searchDomain)
                  )
                  .map((domain) => (
                    <label key={domain.id} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        value={domain.id.toString()}
                        checked={formData.domains.includes(domain.id.toString())}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            domains: e.target.checked
                              ? [...prev.domains, value]
                              : prev.domains.filter((id) => id !== value),
                          }));
                        }}
                      />
                      {domain.name}
                    </label>
                  ))}
              </div>
            </div>
          </div>


        </div>

        <div className={`${styles.buttonGroup} d-flex justify-content-end`}>
          <button
            type="button"
            onClick={() => navigate('/equipes')}
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
  );
};

export default EquipeForm;
