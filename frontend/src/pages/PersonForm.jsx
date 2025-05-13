import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from "../api/api";
import '../assets/styles/PersonForm.css'

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
    position: 'T1',
    diplome: 'Bac+2',
    specialite_diplome: '',
    status: 'En cours',
    ddc: null,
    manager: null,
    backup: null,
    projet: null,
    photo: null,
    is_staff: false,
    is_superuser: false,
    is_active: true,
  });

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
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        }else if(formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (isEditMode) {
        // Mise à jour
        for (let [key, value] of formDataToSend.entries()) {
          console.log(`${key}:`, value);
        }
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Modifier une personne' : 'Créer une nouvelle personne'}
      </h1>
      
      <form onSubmit={handleSubmit} className="personne-form">
        <div className="form-group">
          {/* Section Informations de base */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informations de base</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Matricule*</label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
                disabled={isEditMode}
              />
            </div>

            {!isEditMode && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Mot de passe*</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required={!isEditMode}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Prénom*</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Nom*</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Sexe</label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Sélectionner</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Téléphone</label>
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Photo</label>
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
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

          {/* Section Carrière */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informations professionnelles</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rôle*</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">-- Choisir un rôle --</option>
                <option value="COLLABORATEUR">Collaborateur</option>
                <option value="TL1">Team Leader N1</option>
                <option value="TL2">Team Leader N2</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date début carrière</label>
              <input
                type="date"
                name="dt_Debut_Carriere"
                value={formData.dt_Debut_Carriere}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date embauche*</label>
              <input
                type="date"
                name="dt_Embauche"
                value={formData.dt_Embauche}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Position*</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6'].map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Diplôme*</label>
              <select
                name="diplome"
                value={formData.diplome}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="Bac+2">Bac+2</option>
                <option value="Bac+3">Bac+3</option>
                <option value="Bac+5">Bac+5</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Spécialité diplôme</label>
              <input
                type="text"
                name="specialite_diplome"
                value={formData.specialite_diplome}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Statut*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="En cours">En cours</option>
                <option value="En formation">En formation</option>
                <option value="Bench">Bench</option>
                <option value="Out">Out</option>
                <option value="Management">Management</option>
                <option value="Stage">Stage</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Document DDC</label>
              <input
                type="file"
                name="ddc"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
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
                    Voir le document actuel
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section Relations */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Relations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Manager</label>
                <select
                  name="manager"
                  value={formData.manager || ''}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Aucun manager</option>
                  {managers.map(manager => (
                    <option key={manager.matricule} value={manager.matricule}>
                      {manager.first_name} {manager.last_name} ({manager.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Backup</label>
                <select
                  name="backup"
                  value={formData.backup || ''}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Aucun backup</option>
                  {collaborateurs.map(collab => (
                    <option key={collab.matricule} value={collab.matricule}>
                      {collab.first_name} {collab.last_name} ({collab.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Projet</label>
                <select
                  name="projet"
                  value={formData.projet || ''}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Aucun projet</option>
                  {projets.map(projet => (
                    <option key={projet.wo} value={projet.wo}>
                      {projet.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section Admin */}
          {isEditMode && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Paramètres administrateur</h2>
              
              <div className="mb-4 flex items-center">
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

              <div className="mb-4 flex items-center">
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

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mr-2"
                  id="is_active"
                />
                <label htmlFor="is_active" className="text-gray-700">Compte actif</label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/collaborateurs')}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonForm;