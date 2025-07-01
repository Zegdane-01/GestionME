import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { mediaApi } from '../api/api';
import '../assets/styles/Profile.css'; // Fichier CSS personnalisé
import defaultAvatar from '../assets/images/default-avatar.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faEye } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import ViewProjetModal from '../components/Projet/CRUD/ViewProjetModal';
import ViewEquipeModal from '../components/Equipe/CRUD/ViewEquipeModal';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    matricule:'',
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    role: '',
    dt_Debut_Carriere: '',
    dt_Embauche: '',
    experience_total:'',
    experience_expleo:'',
    position: '',
    specialite_diplome: '',
    diplome: '',
    ddc: '',
    photo: '',
    projet_info: '',
    Equipe_info: '',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showView, setShowView] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState(null);

  const [showEquipeView, setShowEquipeView] = useState(false);
  const [selectedEquipe, setSelectedEquipe] = useState(null);

  const handleProjetClick = () => {
    setSelectedProjet(formData.projet_info);
    setShowView(true);
  };

  const handleEquipeClick = () => {
    // Vérifie si les informations de l'équipe existent dans formData
    if (formData.equipe_info) {
      setSelectedEquipe(formData.equipe_info); // On passe l'objet entier à la modale
      setShowEquipeView(true); // On affiche la modale
    } else {
      toast.info("Ce collaborateur n'est assigné à aucune équipe.");
    }
  };

  const token = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('userData');

  useEffect(() => {
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setProfile(parsedUser);
        setFormData({
          ...parsedUser,
        });
      } catch (error) {
        toast.error("Erreur d'analyse des données utilisateur:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (e.target.id === 'profile-image') {
        setFormData(prev => ({ ...prev, photo: file }));
        } else if (e.target.id === 'file-upload') {
        setFormData(prev => ({ ...prev, ddc: file }));
        }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

const handleSave = () => {
    const formDataToSend = new FormData();
    // Ajouter tous les champs au FormData
      Object.keys(formData).forEach(key => {
         if (key === 'projet') {
          // Ne rien faire pour ne pas envoyer projet
          return;
        }
        if (formData[key] === null || formData[key] === '') {
          formDataToSend.append(key, ''); // Envoie une chaîne vide pour les valeurs null
        } 
        if (key === 'photo' || key === 'ddc') {
          if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
        }else if (key === 'manager' || key === 'backup' || key === 'projet') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        }else if(formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
        api.put('/personne/personnes/me/', formDataToSend, {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
            }
        }).then(response => {
            setProfile(response.data);
            setEditMode(false);
            localStorage.setItem('userData', JSON.stringify(response.data));
            window.location.reload();
        }).catch(error => {
            toast.error("Détails de l'erreur:", {
            config: error.config,
            response: error.response?.data,
            status: error.response?.status
            });
        });
    };
  const handleEditToggle = () => {
    setEditMode(true);
  };

  


  if (!profile) return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </div>
  );


  const getExperienceText = (totalMonths) => {
      if (typeof totalMonths !== 'number' || isNaN(totalMonths) || totalMonths < 0) {
          return '0 ans, 0 mois';
      }
      
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      
      return `${years} an${years > 1 ? 's' : ''}, ${months} mois`;
  };
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    try {
      await api.post('/personne/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success("Mot de passe changé avec succès");
      setShowPasswordModal(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du changement de mot de passe");
    }
  };
  const renderInput = (name, label, type = 'text') => (
    <div className="col-md-6 mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="form-control"
        disabled={!editMode}
      />
    </div>
  );
  const renderInputDisabled = (name, label, type = 'text') => (
    <div className="col-md-6 mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="form-control"
        disabled
      />
    </div>
  );
  const renderExperienceInput = (name, label, totalMonths) => (
    <div className="col-md-6 mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={getExperienceText(parseInt(formData[totalMonths], 10) || 0 )} // Affiche l'expérience formatée
        readOnly // Pas modifiable si tu veux
        className="form-control"
        disabled 
      />
    </div>
  );

  if (!profile) return <div>Chargement...</div>;

  return (
    <div className="container profile-container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="profile-title">Profil</h1>
      </div>

      <div className="card profile-card mb-4">
        <div className="card-header profile-header text-white">
          <div className="row align-items-center">
            <div className="col-md-3 text-center text-md-start">
              <div className="profile-avatar-container mb-3 mb-md-0">
                
                <img
                    src={profile.photo ? `${mediaApi.defaults.baseURL}${profile.photo}` : defaultAvatar}
                    alt="Profile"
                    className="profile-avatar"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                    }}
                />
              </div>
            </div>
            <div className="col-md-9">
              <div className="text-center text-md-start">
                <h1 className="fw-bold mb-2">
                  {formData.last_name} {formData.first_name}
                </h1>
                <h6>
                  {formData.role}
                </h6>

                <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 mb-2">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                    <span>{formData.email}</span>
                  </div>
                  <div className="d-flex align-items-center ms-md-4">
                    <FontAwesomeIcon icon={faPhone} className="me-2" />
                    <span>{formData.telephone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {renderInputDisabled('matricule', 'Matricule')}
              {renderInputDisabled('sexe', 'Sexe')}
              {renderInputDisabled('first_name', 'Prénom')}
              {renderInputDisabled('last_name', 'Nom')}
              {renderInput('telephone', 'Téléphone', 'text')}
              {renderInput('email', 'Email')}
              <div className="col-md-6 mb-3">
                <label htmlFor="diplome" className="form-label">
                  Diplôme
                </label>
                <select
                  id="diplome"
                  name="diplome"
                  className="form-select"
                  value={formData.diplome || ""}
                  onChange={handleSelectChange}
                  disabled={!editMode}
                >
                  <option value="">Sélectionner un diplôme</option>
                  <option value="Bac+2">Bac+2</option>
                  <option value="Bac+3">Bac+3</option>
                  <option value="Bac+5">Bac+5</option>
                </select>
              </div>
              {renderInput('specialite_diplome', 'Spécialité', 'text')}
              {renderInput('dt_Embauche', "Date d'embauche", 'date')}
              {renderInput('dt_Debut_Carriere', 'Début carrière', 'date')}
              {renderExperienceInput('experience_expleo', 'Expérience Expleo', 'experience_expleo')}
              {renderExperienceInput('experience_total','Expérience totale','experience_total')}
              {renderInputDisabled('role','Rôle','text')}
              {renderInputDisabled('position', 'Position', 'text')}
              <div className="col-md-6 mb-3">
                <label htmlFor="equipe" className="form-label">Équipe</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="equipe"
                    name="equipe"
                    // L'optional chaining (?) est crucial si equipe_info peut être null
                    value={formData.equipe_info?.name || 'Aucune équipe'}
                    readOnly
                    className="form-control"
                    disabled
                  />
                  <span className="input-group-text" onClick={handleEquipeClick} style={{ cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faEye} />
                  </span>
                </div>
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="projet" className="form-label">Projet</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="projet"
                    name="projet"
                    value={formData.projet_info?.nom || ''}
                    readOnly
                    className="form-control"
                    disabled
                  />
                  <span className="input-group-text" onClick={handleProjetClick} style={{ cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faEye} />
                  </span>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="manager" className="form-label">Manager</label>
                <input
                  type="text"
                  id="manager"
                  name="manager"
                  value={`${formData.manager_info?.first_name || ''} ${formData.manager_info?.last_name || ''}`}
                  readOnly
                  className="form-control"
                  disabled
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="manager" className="form-label">Backup</label>
                <input
                  type="text"
                  id="manager"
                  name="manager"
                  value={`${formData.backup_info?.first_name || ''} ${formData.backup_info?.last_name || ''}`}
                  readOnly
                  className="form-control"
                  disabled
                />
              </div>
              {renderInputDisabled('status', 'Statut','text')}
              {!editMode ? (
                <div className="col-md-12">
                  <div className="info-group">
                    <label className="info-label">DDC</label>
                    <p className="info-value">
                      {profile.ddc ? (
                        <a href={profile.ddc} rel="noopener noreferrer" download>Télécharger le document</a>
                      ) : '---'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                   <div className="col-md-6 mb-3">
                    <label htmlFor="file-upload" className="form-label">DDC (fichier Word)</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ddc || ''}
                        readOnly
                      />
                      <label className="input-group-text btn btn-outline-secondary" htmlFor="file-upload">
                        Parcourir
                      </label>
                      <input
                        id="file-upload"
                        name="ddc"
                        type="file"
                        className="d-none"
                        onChange={handleFileChange}
                        accept=".doc,.docx"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="image-upload" className="form-label">Image</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.photo? formData.photo || formData.photo : ''}
                        readOnly
                      />
                      <label className="input-group-text btn btn-outline-secondary" htmlFor="image-upload">
                        Parcourir
                      </label>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        className="d-none"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </div>
                  </div>
                </>

              )}
            </div>

            {editMode ? (
              <div className="mt-3">
                <button type="submit" className="btn btn-success me-2" onClick={handleSave}>Enregistrer</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Annuler</button>
              </div>
            ) : (
              <>
                <button className="btn btn-primary me-2" onClick={handleEditToggle} type="button">
                  <i className="bi bi-pencil me-2"></i> Modifier
                </button>
                <button 
                  type="button"
                  className="btn btn-warning me-2" 
                  onClick={() => setShowPasswordModal(true)}
                >
                  <i className="bi bi-lock me-2"></i> Changer mot de passe
                </button>
              </>
            )}
          </form>
        </div>
      </div>
      {showPasswordModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Changer le mot de passe</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Ancien mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ViewProjetModal
        show={showView}
        onHide={() => setShowView(false)}
        projet={selectedProjet}
      />
      <ViewEquipeModal
        show={showEquipeView}
        onHide={() => setShowEquipeView(false)}
        equipe={selectedEquipe}
      />
    </div>
  );
};

export default Profile;