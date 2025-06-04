import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from "../api/api";
import styles from '../../src/assets/styles/Form.module.css'
const PersonForm = () => {
  const params = useParams();
  const matricule = params.matricule || params.id;
  const navigate = useNavigate();
  const isEditMode = matricule !== undefined;
  
  // États initiaux du formulaire
  const [formData, setFormData] = useState({
    matricule: '',
    password: '',
    first_name: '',
    last_name: '',
    sexe: '',
    email: '',
    telephone: '',
    role: '',
    dt_Debut_Carriere: '',
    dt_Embauche: '',
    position: '',
    diplome: '',
    specialite_diplome: '',
    status: '',
    ddc: null,
    manager: null,
    backup: null,
    projet: null,
    photo: null,
    is_staff: false,
    is_superuser: false,
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};
    if (!formData.matricule) newErrors.matricule = "Le matricule est requis.";
    if (!formData.first_name) newErrors.first_name = "Le prénom est requis.";
    if (!formData.last_name) newErrors.last_name = "Le nom est requis.";
    if (!formData.sexe) newErrors.sexe = "Le sexe est requis.";
    if (!formData.role) newErrors.role = "Le rôle est requis.";
    if (!formData.dt_Embauche) newErrors.dt_Embauche = "La date d'embauche est requise.";
    if (!formData.position) newErrors.position = "La position est requise.";
    if (!formData.status) newErrors.status = "Le statut est requis.";
    if (formData.email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@expleogroup\.com$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide se terminant par @expleogroup.com";
    }
  }
    return newErrors;
  };


  const [managers, setManagers] = useState([]);
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les données initiales pour le mode édition
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Charger les listes pour les selects
        const [managersRes, collaborateursRes, projetsRes] = await Promise.all([
          api.get('/personne/personnes/'),
          api.get('/personne/personnes/'),
          api.get('/projet/projets/'),
        ]);

        setManagers(managersRes.data);
        setCollaborateurs(collaborateursRes.data);
        setProjets(projetsRes.data);

        // Si en mode édition, charger les données de la personne
        if (isEditMode && matricule) {
          const response = await api.get(`/personne/personnes/${matricule}/`);
          const personneData = response.data;
          
          // Formater les dates pour l'input date
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };

          setFormData({
            ...personneData,
            dt_Debut_Carriere: formatDate(personneData.dt_Debut_Carriere),
            dt_Embauche: formatDate(personneData.dt_Embauche),
            password: '', // Ne pas pré-remplir le mot de passe
            manager: personneData.manager || null,
            backup: personneData.backup || null,
            projet: personneData.projet || null,
          });
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
        console.error(error);
      }
    };

    fetchInitialData();
  }, [matricule, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'file' ? files[0] : 
              value
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

        const formDataToSend = new FormData();
        
        // Ajouter tous les champs au FormData
        Object.keys(formData).forEach(key => {
          if (key === 'photo' || key === 'ddc') {
            if (formData[key] instanceof File) {
              formDataToSend.append(key, formData[key]);
            }
          }else if (key === 'manager' || key === 'backup' || key === 'projet') {
            formDataToSend.append(key, formData[key] ?? '');
          }else if(formData[key] !== null && formData[key] !== undefined) {
            formDataToSend.append(key, formData[key]);
          }
        });

        let response;
        if (isEditMode) {
          response = await api.put(`/personne/personnes/${matricule}/`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success('Personne mise à jour avec succès');
        } else {
          // Création
          response = await api.post('/personne/personnes/', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success('Personne créée avec succès');
        }

        navigate('/collaborateurs');
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
    }};



  return (
    <div className="container py-5">
      <h1 className={`${styles.formTitle} mb-5 text-center`}>
        {isEditMode ? 'Modifier un projet' : 'Créer un nouveau collaborateur'}
      </h1>

      <form onSubmit={handleSubmit} className={styles.projetFormCard}>

        <div className="row g-4 mb-4"> 
            
          <div className="col-md-6">
             <div className={styles.formGroup}>
              <label className={styles.formLabel}>Matricule<span style={{ color: 'red' }}> *</span></label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.matricule ? styles.inputError : ''}`}
                disabled={isEditMode}
              />
              {errors.matricule && <p className={styles.errorText}>{errors.matricule}</p>}
            </div>
          </div>

          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Sexe<span style={{ color: 'red' }}> *</span></label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.sexe ? styles.inputError : ''}`}
              >
                <option value="">Sélectionner</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              {errors.sexe && <p className={styles.errorText}>{errors.sexe}</p>}
            </div>
          </div>

        </div>

        <div className="row g-4 mb-4"> 
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Prénom<span style={{ color: 'red' }}> *</span></label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.first_name ? styles.inputError : ''}`}
              />
              {errors.first_name && <p className={styles.errorText}>{errors.first_name}</p>}
            </div>
         </div>

        <div className="col-md-6">
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nom<span style={{ color: 'red' }}> *</span></label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`${styles.formControl} ${errors.last_name ? styles.inputError : ''}`}
            />
            {errors.last_name && <p className={styles.errorText}>{errors.last_name}</p>}
          </div>
        </div>
      </div>

        <div className="row g-4 mb-4"> 

            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.formControl} ${errors.email ? styles.inputError : ''}`}
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Téléphone</label>
                <input
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={styles.formControl}
                />
              </div>
            </div>

        </div>

        <div className="row g-4 mb-4"> 

          <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date d'embauche<span style={{ color: 'red' }}> *</span></label>
                <input
                  type="date"
                  name="dt_Embauche"
                  value={formData.dt_Embauche}
                  onChange={handleChange}
                  className={`${styles.formControl} ${errors.dt_Embauche ? styles.inputError : ''}`}
                />
                {errors.dt_Embauche && <p className={styles.errorText}>{errors.dt_Embauche}</p>}
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date début de carrière</label>
                <input
                  type="date"
                  name="dt_Debut_Carriere"
                  value={formData.dt_Debut_Carriere}
                  onChange={handleChange}
                  className={styles.formControl}
                />
              </div>
            </div>

        </div>

        <div className="row g-4 mb-4"> 

          <div className="col-md-6">
             <div className={styles.formGroup}>
              <label className={styles.formLabel}>Diplôme</label>
                <select
                  name="diplome"
                  value={formData.diplome}
                  onChange={handleChange}
                  className={styles.formControl}
                >
                  <option value="">-- Choisir le diplôme --</option>
                  <option value="Bac+2">Bac+2</option>
                  <option value="Bac+3">Bac+3</option>
                  <option value="Bac+5">Bac+5</option>
                </select>
              </div>
            </div>

          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Spécialité diplôme</label>
              <input
                type="text"
                name="specialite_diplome"
                value={formData.specialite_diplome}
                onChange={handleChange}
                className={styles.formControl}
              />
            </div>
          </div>

        </div>

        <div className="row g-4 mb-4"> 

          <div className="col-md-6">
             <div className={styles.formGroup}>
                <label className={styles.formLabel}>Statut<span style={{ color: 'red' }}> *</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`${styles.formControl} ${errors.status ? styles.inputError : ''}`}
                >
                  <option value="">-- Choisir le statut --</option>
                  <option value="En cours">En cours</option>
                  <option value="En formation">En formation</option>
                  <option value="Bench">Bench</option>
                  <option value="Out">Out</option>
                  <option value="Management">Management</option>
                  <option value="Stage">Stage</option>
                </select>
                {errors.status && <p className={styles.errorText}>{errors.status}</p>}
              </div>
            </div>

          <div className="col-md-6">
             <div className={styles.formGroup}>
                <label className={styles.formLabel}>Position<span style={{ color: 'red' }}> *</span></label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`${styles.formControl} ${errors.position ? styles.inputError : ''}`}
                >
                  <option value="">-- Choisir une position --</option>
                  {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6'].map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                {errors.position && <p className={styles.errorText}>{errors.position}</p>}
              </div>
            </div>

        </div>

        <div className="row g-4 mb-4"> 

          <div className="col-md-6">
             <div className={styles.formGroup}>
                <label className={styles.formLabel}>Manager</label>
                <select
                  name="manager"
                  value={formData.manager || ''}
                  onChange={handleSelectChange}
                  className={styles.formControl}
                >
                  <option value="">Aucun manager</option>
                  {managers.map(manager => (
                    <option key={manager.matricule} value={manager.matricule}>
                      {manager.first_name} {manager.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          <div className="col-md-6">
             <div className={styles.formGroup}>
              <label className={styles.formLabel}>Backup</label>
              <select
                name="backup"
                value={formData.backup || ''}
                onChange={handleSelectChange}
                className={styles.formControl}
              >
                <option value="">Aucun backup</option>
                {collaborateurs.map(collab => (
                  <option key={collab.matricule} value={collab.matricule}>
                    {collab.first_name} {collab.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
        </div>

        <div className="row g-4 mb-4"> 

          <div className="col-md-6">
             <div className={styles.formGroup}>
                <label className={styles.formLabel}>Projet</label>
              <select
                name="projet"
                value={formData.projet || ''}
                onChange={handleSelectChange}
                className={styles.formControl}
              >
                <option value="">Aucun projet</option>
                {projets.map(projet => (
                  <option key={projet.projet_id} value={projet.projet_id}>
                    {projet.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-6">
             <div className={styles.formGroup}>
              <label className={styles.formLabel}>Rôle<span style={{ color: 'red' }}> *</span></label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.role ? styles.inputError : ''}`}
              >
                <option value="">-- Choisir un rôle --</option>
                <option value="COLLABORATEUR">Collaborateur</option>
                <option value="TL1">Team Leader N1</option>
                <option value="TL2">Team Leader N2</option>
              </select>
              {errors.role && <p className={styles.errorText}>{errors.role}</p>}
            </div>
          </div>
            

        </div>

        <div className="row g-4 mb-4"> 

          <div className="col-md-6">
             <div className={styles.formGroup}>
              <label className={styles.formLabel}>Document DDC</label>
              <input
                type="file"
                name="ddc"
                onChange={handleChange}
                className={styles.formControl}
                accept=".doc,.docx"
              />
              {isEditMode && formData.ddc && (
                <div className="mt-2">
                  <a 
                    href={formData.ddc} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Télécharger le document
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
             <div className={styles.formGroup}>
              <label className={styles.formLabel}>Photo</label>
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                className={styles.formControl}
                accept="image/*"
              />
              {isEditMode && formData.photo && (
                <div className="mt-2">
                  <img 
                    src={formData.photo} 
                    alt="Photo actuelle" 
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="row g-4 mb-4"> 

            <div className="col-md-6 flex items-center d-none">
              <input
                type="checkbox"
                name="is_staff"
                checked={formData.is_staff}
                onChange={handleChange}
                className="mr-2"
                id="is_staff"
              />
              <label htmlFor="is_staff" className="text-gray-700">Staff</label>
            </div>
            

            <div className="col-md-6 flex items-center d-none">
              <input
                type="checkbox"
                name="is_superuser"
                checked={formData.is_superuser}
                onChange={handleChange}
                className="mr-2"
                id="is_superuser"
              />
              <label htmlFor="is_superuser" className="text-gray-700">Superutilisateur</label>
            </div>

        </div>

        <div className="row g-4 mb-4"> 

          <div className="col-md-6 flex items-center">
            <div className={`${styles.formGroup}} form-check form-switch`}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                class="form-check-input"
                id="is_active"
              />
              <label htmlFor="is_active" class="text-gray-700 form-check-label">Compte actif</label>
             </div>
          </div>
        </div>

        <div className={`${styles.buttonGroup} d-flex justify-content-end`}> 
          <button
            type="button"
            onClick={() => navigate('/collaborateurs')}
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

export default PersonForm;