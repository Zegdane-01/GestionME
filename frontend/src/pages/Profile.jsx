import { logout } from '../services/auth';
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { mediaApi } from '../api/api';
import '../assets/styles/Profile.css'; // Fichier CSS personnalisé
import defaultAvatar from '../assets/images/default-avatar.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
const Profile = () => {
  const handleLogout = () => {
    logout(); // Appel de la fonction de déconnexion
  };
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personnelle');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    dt_Debut_Carriere: '',
    dt_Embauche: '',
    experience_total:'',
    experience_expleo:'',
    position: '',
    specialite_diplome: '',
    diplome: '',
    specialite: '',
    ddc: '',
    photo: '',
  });

  const token = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('userData');

  useEffect(() => {
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setProfile(parsedUser);
        setFormData({
          first_name: parsedUser.first_name || '',
          last_name: parsedUser.last_name || '',
          email: parsedUser.email || '',
          telephone: parsedUser.telephone || '',
          dt_Debut_Carriere: parsedUser.dt_Debut_Carriere || '',
          dt_Embauche: parsedUser.dt_Embauche || '',
          experience_total:'',
          experience_expleo:'',
          position: parsedUser.position || '',
          specialite_diplome: parsedUser.specialite_diplome || '',
          diplome: parsedUser.diplome || '',
          specialite: parsedUser.specialite || '',
          ddc: parsedUser.ddc || '',
          photo: parsedUser.photo || '',
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleCancel = () => {
    setEditMode(false);
    // Réinitialiser le formulaire avec les données actuelles du profil
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        telephone: profile.telephone || '',
        position: profile.position || '',
        specialite_diplome: profile.specialite_diplome || '',
        diplome: profile.diplome || '',
        specialite: profile.specialite || '',
        ddc: profile.ddc || '',
        photo: profile.photo || '',
      });
    }
  };

  const formatDateString = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return '-';
    }
  };

  const editableFields = [
    { id: 'telephone', label: 'Téléphone', type: 'text' },
  ];

  if (!profile) return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </div>
  );

  // Vérification des valeurs pour s'assurer qu'elles sont bien des chaînes ou des valeurs primitives
  const safeStr = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

    const getExperienceText = (totalMonths) => {
        if (typeof totalMonths !== 'number' || isNaN(totalMonths) || totalMonths < 0) {
            return '0 ans, 0 mois';
        }
        
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        
        return `${years} an${years > 1 ? 's' : ''}, ${months} mois`;
    };

  return (
    <div className="container profile-container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="profile-title">Profil Collaborateur</h1>
        {!editMode && (
          <button className="btn btn-primary" onClick={handleEditToggle}>
            <i className="bi bi-pencil me-2"></i> Modifier
          </button>
        )}
        <button className="btn btn-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Déconnexion
        </button>
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
                {editMode && (
                    <div className="profile-avatar-edit">
                    <label htmlFor="profile-image" className="cursor-pointer" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                        <FontAwesomeIcon icon={faCamera} />
                    </label>
                    <input 
                        id="profile-image" 
                        type="file" 
                        style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }} 
                        onChange={handleFileChange}
                        accept="image/*" 
                    />
                    </div>
                )}
              </div>
            </div>
            <div className="col-md-9">
              <div className="text-center text-md-start">
                <small className="opacity-75">Matricule: {safeStr(profile.matricule) || '---'}</small>
                <h2 className="fw-bold mb-2">{safeStr(profile.last_name)} {safeStr(profile.first_name)}</h2>
                
                <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 mb-2">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-envelope me-2"></i>
                    <span>{safeStr(profile.email)}</span>
                  </div>
                  <div className="d-flex align-items-center ms-md-4">
                    <i className="bi bi-telephone me-2"></i>
                    <span>{safeStr(profile.telephone)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <ul className="nav nav-tabs mb-4" id="profileTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'personnelle' ? 'active' : ''}`}
                onClick={() => setActiveTab('personnelle')}
                type="button"
              >
                Personnelle
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'professionnelle' ? 'active' : ''}`}
                onClick={() => setActiveTab('professionnelle')}
                type="button"
              >
                Professionnelle
              </button>
            </li>
          </ul>

          <div className="tab-content" id="profileTabsContent">
            <div className={`tab-pane fade ${activeTab === 'personnelle' ? 'show active' : ''}`} id="personnelle">
              {editMode ? (
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="row g-4">
                    {editableFields.map((field) => (
                      <div key={field.id} className="col-md-6">
                        <div className="form-group">
                          <label htmlFor={field.id} className="form-label">{field.label}</label>
                          <input
                            id={field.id}
                            name={field.id}
                            type={field.type}
                            className="form-control"
                            value={formData[field.id]}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="diplome" className="form-label">Diplôme</label>
                        <select 
                          id="diplome"
                          name="diplome"
                          className="form-select"
                          value={formData.diplome}
                          onChange={handleSelectChange}
                        >
                          <option value="">Sélectionner un diplôme</option>
                          <option value="Bac+2">Bac+2</option>
                          <option value="Bac+3">Bac+3</option>
                          <option value="Bac+5">Bac+5</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="specialite" className="form-label">Spécialité</label>
                        <input
                          id="specialite"
                          name="specialite"
                          className="form-control"
                          value={formData.specialite}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                    <div className="form-group">
                    <label htmlFor="dt_Embauche" className="form-label">Date d'embauche</label>
                    <input
                        id="dt_Embauche"
                        name="dt_Embauche"
                        type="date"
                        className="form-control"
                        value={formData.dt_Embauche?.split('T')[0] || ''}
                        onChange={handleChange}
                    />
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="form-group">
                    <label htmlFor="dt_Debut_Carriere" className="form-label">Date début carrière</label>
                    <input
                        id="dt_Debut_Carriere"
                        name="dt_Debut_Carriere"
                        type="date"
                        className="form-control"
                        value={formData.dt_Debut_Carriere?.split('T')[0] || ''}
                        onChange={handleChange}
                    />
                    </div>
                </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="ddc" className="form-label">DDC (fichier Word)</label>
                            <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={formData.ddc || ''}
                                readOnly
                            />
                            <label className="input-group-text" htmlFor="file-upload">Parcourir</label>
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
                        </div>
                  </div>

                  <hr className="my-4" />
                  
                  <div className="text-end">
                    <button type="button" className="btn btn-outline-secondary me-2" onClick={handleCancel}>
                      <i className="bi bi-x me-1"></i> Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check me-1"></i> Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-view">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Matricule</label>
                        <p className="info-value">{safeStr(profile.matricule) || '---'}</p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Sexe</label>
                        <p className="info-value">{safeStr(profile.sexe) || '---'}</p>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Email</label>
                        <p className="info-value">{safeStr(profile.email)}</p>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Téléphone</label>
                        <p className="info-value">{safeStr(profile.telephone)}</p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Date début de carrière</label>
                        <p className="info-value">{formatDateString(profile.dt_Debut_Carriere)}</p>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Date d'embauche</label>
                        <p className="info-value">{formatDateString(profile.dt_Embauche)}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Expérience Expleo</label>
                        <p className="info-value">
                          {getExperienceText(profile.experience_expleo)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Expérience totale</label>
                        <p className="info-value">
                          {getExperienceText(profile.experience_total)}
                        </p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Position</label>
                        <p className="info-value">{safeStr(profile.position) || '---'}</p>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Diplôme</label>
                        <p className="info-value">{safeStr(profile.diplome) || '---'}</p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Spécialité</label>
                        <p className="info-value">{safeStr(profile.specialite) || '---'}</p>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">Status</label>
                        <p className="info-value">{safeStr(profile.status) || '---'}</p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-group">
                        <label className="info-label">DDC</label>
                        <p className="info-value">
                          {profile.ddc ? (
                            <a href={profile.ddc} rel="noopener noreferrer" download>Télécharger le document</a>
                          ) : '---'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`tab-pane fade ${activeTab === 'professionnelle' ? 'show active' : ''}`} id="professionnelle">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="info-group">
                    <label className="info-label">Nom du projet</label>
                    <p className="info-value">{safeStr(profile.projet_info?.nom) || '---'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-group">
                    <label className="info-label">Rôle</label>
                    <p className="info-value">{safeStr(profile.role) || '---'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-group">
                    <label className="info-label">Manager</label>
                    <p className="info-value">{safeStr(profile.manager_info?.first_name)|| '---'} {safeStr(profile.manager_info?.last_name)}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-group">
                    <label className="info-label">Backup</label>
                    <p className="info-value">{safeStr(profile.backup_info?.first_name) || '---'} {safeStr(profile.backup_info?.last_name) }</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;