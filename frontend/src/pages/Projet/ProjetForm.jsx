import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from "../../api/api";
import styles from '../../assets/styles/Projet/ProjetForm.module.css';

const ProjetForm = () => {
  const params = useParams();
  const projetId = params.id;
  const navigate = useNavigate();
  const isEditMode = projetId !== undefined;
  
  // États initiaux du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    ordre_travail: '',
    direct_client: '',
    final_client: '',
    sop: '',
    ibu: '',
    cbu: '',
    tl: null,
    date_demarrage: '',
    chef_de_projet: '',
    statut: '',
    descriptif: '',
  });

  const [errors, setErrors] = useState({});
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom) newErrors.nom = "Le nom du projet est requis.";
    if (!formData.code) newErrors.code = "Le code du projet est requis.";
    if (!formData.direct_client) newErrors.direct_client = "Le client direct est requis.";
    if (!formData.final_client) newErrors.final_client = "Le client final est requis.";
    if (!formData.sop) newErrors.sop = "Le SOP est requis.";
    if (!formData.statut) newErrors.statut = "Le statut est requis.";
    if (!formData.date_demarrage) newErrors.date_demarrage = "La date de démarrage est requise.";
    if (!formData.descriptif) newErrors.descriptif = "Le descriptif est requis.";
    
    return newErrors;
  };

  // Charger les données initiales pour le mode édition
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Charger la liste des team leaders
        const teamLeadersRes = await api.get('/personne/personnes/?role=TL1,TL2');
        setTeamLeaders(teamLeadersRes.data);

        // Si en mode édition, charger les données du projet
        if (isEditMode && projetId) {
          const response = await api.get(`/projet/projets/${projetId}/`);
          const projetData = response.data;
          
          // Formater la date pour l'input date
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };

          setFormData({
            ...projetData,
            date_demarrage: formatDate(projetData.date_demarrage),
            tl: projetData.tl || null,
          });
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
        console.error(error);
      }
    };

    fetchInitialData();
  }, [projetId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      try {
        const formDataToSend = { ...formData };
        
        let response;
        if (isEditMode) {
          response = await api.put(`/projet/projets/${projetId}/`, formDataToSend);
          toast.success('Projet mis à jour avec succès');
        } else {
          response = await api.post('/projet/projets/', formDataToSend);
          toast.success('Projet créé avec succès');
        }

        navigate('/projets');
      } catch (error) {
        console.error(error);
        if (error.response) {
          // Afficher les erreurs de validation
          const errors = error.response.data;
          Object.keys(errors).forEach(key => {
            toast.error(`${key}: ${errors[key].join(' ')}`);
          });
        } else {
          toast.error('Une erreur est survenue');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container py-5">
      <h1 className={`${styles.formTitle} mb-5 text-center`}> {/* Added text-center for a more prominent title */}
        {isEditMode ? 'Modifier un projet' : 'Créer un nouveau projet'}
      </h1>

      <form onSubmit={handleSubmit} className={styles.projetFormCard}> {/* Changed to projetFormCard for a distinct look */}
        {/* Optional: A subtle header for the form content */}
        <div className={styles.formSectionHeader}>
          <p className="mb-0">Détails du projet</p> {/* mb-0 to remove default margin-bottom */}
        </div>

        <div className="row g-4 mb-4"> {/* g-4 for consistent spacing, mb-4 for section margin */}
          
          <div className="col-md-12">
            <div className={styles.formGroup}>
              <label htmlFor="nom" className={styles.formLabel}>Nom du projet<span className="text-danger"> *</span></label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.nom ? styles.inputError : ''}`}
              />
              {errors.nom && <p className={styles.errorText}>{errors.nom}</p>}
            </div>
          </div>

          <div className="col-md-6">
            <div className={styles.formGroup}>
                <label htmlFor="code" className={styles.formLabel}>Code projet<span className="text-danger"> *</span></label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`${styles.formControl} ${errors.code ? styles.inputError : ''}`}
                />
                {errors.code && <p className={styles.errorText}>{errors.code}</p>}
              </div>
          </div>
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="ordre_travail" className={styles.formLabel}>Ordre de travail</label>
              <input
                type="text"
                id="ordre_travail"
                name="ordre_travail"
                value={formData.ordre_travail}
                onChange={handleChange}
                className={styles.formControl}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="direct_client" className={styles.formLabel}>Client direct<span className="text-danger"> *</span></label>
              <input
                type="text"
                id="direct_client"
                name="direct_client"
                value={formData.direct_client}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.direct_client ? styles.inputError : ''}`}
              />
              {errors.direct_client && <p className={styles.errorText}>{errors.direct_client}</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="final_client" className={styles.formLabel}>Client final<span className="text-danger"> *</span></label>
              <input
                type="text"
                id="final_client"
                name="final_client"
                value={formData.final_client}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.final_client ? styles.inputError : ''}`}
              />
              {errors.final_client && <p className={styles.errorText}>{errors.final_client}</p>}
            </div>
          </div>
        </div>

        

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="cbu" className={styles.formLabel}>CBU (ex: ME/PCPR)</label>
              <input
                type="text"
                id="cbu"
                name="cbu"
                value={formData.cbu}
                onChange={handleChange}
                className={styles.formControl}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="ibu" className={styles.formLabel}>IBU (secteur)</label>
              <select // Changed from input to select
                id="ibu"
                name="ibu"
                value={formData.ibu}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.ibu ? styles.inputError : ''}`}
              >
                <option value="">-- Sélectionner --</option>
                <option value="AUTO">AUTO</option>
                <option value="AERO">AERO</option>
                <option value="FERRO">FERRO</option>
              </select>
              {errors.ibu && <p className={styles.errorText}>{errors.ibu}</p>} {/* Error display for IBU */}
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="tl" className={styles.formLabel}>Team Leader</label>
              <select
                id="tl"
                name="tl"
                value={formData.tl || ''}
                onChange={handleSelectChange}
                className={styles.formControl}
              >
                <option value="">Aucun Team Leader</option>
                {teamLeaders.map(tl => (
                  <option key={tl.matricule} value={tl.matricule}>
                    {tl.first_name} {tl.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="chef_de_projet" className={styles.formLabel}>Chef de projet</label>
              <input
                type="text"
                id="chef_de_projet"
                name="chef_de_projet"
                value={formData.chef_de_projet}
                onChange={handleChange}
                className={styles.formControl}
              />
            </div>
          </div>
          
        </div>

        <div className="row g-4 mb-4">
          <div className="col">
            <div className={styles.formGroup}>
              <label htmlFor="date_demarrage" className={styles.formLabel}>Date de démarrage<span className="text-danger"> *</span></label>
              <input
                type="date"
                id="date_demarrage"
                name="date_demarrage"
                value={formData.date_demarrage}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.date_demarrage ? styles.inputError : ''}`}
              />
              {errors.date_demarrage && <p className={styles.errorText}>{errors.date_demarrage}</p>}
            </div>
          </div>
          
        </div>

        <div className="row g-4 mb-4">
          
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="sop" className={styles.formLabel}>SOP Projet<span className="text-danger"> *</span></label>
              <select
                id="sop"
                name="sop"
                value={formData.sop}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.sop ? styles.inputError : ''}`}
              >
                <option value="">-- Sélectionner --</option>
                <option value="Interne">Interne</option>
                <option value="Externe">Externe</option>
              </select>
              {errors.sop && <p className={styles.errorText}>{errors.sop}</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label htmlFor="statut" className={styles.formLabel}>Statut<span className="text-danger"> *</span></label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.statut ? styles.inputError : ''}`}
              >
                <option value="">-- Sélectionner --</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
              {errors.sop && <p className={styles.errorText}>{errors.statut}</p>}
            </div>
          </div>
        </div>
        
        <div className="row mb-5">
          <div className="col-12">
            <div className={styles.formGroup}>
              <label htmlFor="descriptif" className={styles.formLabel}>Descriptif<span className="text-danger"> *</span></label>
              <textarea
                id="descriptif"
                name="descriptif"
                value={formData.descriptif}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.descriptif ? styles.inputError : ''}`}
                rows="5"
              ></textarea>
              {errors.descriptif && <p className={styles.errorText}>{errors.descriptif}</p>}
            </div>
          </div>
        </div>

        <div className={`${styles.buttonGroup} d-flex justify-content-end`}> {/* Removed mt-5 as mb-5 on last row handles spacing */}
          <button
            type="button"
            onClick={() => navigate('/projets')}
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

export default ProjetForm;