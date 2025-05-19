import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from "../../api/api";
import '../../assets/styles/Projet/ProjetForm.css';

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
    statut: 'Actif',
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Modifier un projet' : 'Créer un nouveau projet'}
      </h1>
      
      <form onSubmit={handleSubmit} className="personne-form">
        <div className="form-group">
          {/* Informations de base du projet */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informations de base</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Nom du projet<span style={{ color: 'red' }}> *</span></label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${errors.nom ? 'border-danger' : ''}`}
              />
              {errors.nom && <p className="text-red-500 text-sm text-danger">{errors.nom}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Code projet<span style={{ color: 'red' }}> *</span></label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${errors.code ? 'border-danger' : ''}`}
                disabled={isEditMode}
              />
              {errors.code && <p className="text-red-500 text-sm text-danger">{errors.code}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ordre de travail</label>
              <input
                type="text"
                name="ordre_travail"
                value={formData.ordre_travail}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Client direct<span style={{ color: 'red' }}> *</span></label>
              <input
                type="text"
                name="direct_client"
                value={formData.direct_client}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${errors.direct_client ? 'border-danger' : ''}`}
              />
              {errors.direct_client && <p className="text-red-500 text-sm text-danger">{errors.direct_client}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Client final<span style={{ color: 'red' }}> *</span></label>
              <input
                type="text"
                name="final_client"
                value={formData.final_client}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${errors.final_client ? 'border-danger' : ''}`}
              />
              {errors.final_client && <p className="text-red-500 text-sm text-danger">{errors.final_client}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">SOP Projet<span style={{ color: 'red' }}> *</span></label>
              <select
                name="sop"
                value={formData.sop}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${errors.sop ? 'border-danger' : ''}`}
              >
                <option value="">Sélectionner</option>
                <option value="Interne">Interne</option>
                <option value="Externe">Externe</option>
              </select>
              {errors.sop && <p className="text-red-500 text-sm text-danger">{errors.sop}</p>}
            </div>
          </div>

          {/* Section Détails du projet */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Détails du projet</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">IBU (secteur)</label>
              <input
                type="text"
                name="ibu"
                value={formData.ibu}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">CBU (ex: ME/PCPR)</label>
              <input
                type="text"
                name="cbu"
                value={formData.cbu}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Team Leader</label>
              <select
                name="tl"
                value={formData.tl || ''}
                onChange={handleSelectChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Aucun Team Leader</option>
                {teamLeaders.map(tl => (
                  <option key={tl.matricule} value={tl.matricule}>
                    {tl.first_name} {tl.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date de démarrage<span style={{ color: 'red' }}> *</span></label>
              <input
                type="date"
                name="date_demarrage"
                value={formData.date_demarrage}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${errors.date_demarrage ? 'border-danger' : ''}`}
              />
              {errors.date_demarrage && <p className="text-red-500 text-sm text-danger">{errors.date_demarrage}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Chef de projet</label>
              <input
                type="text"
                name="chef_de_projet"
                value={formData.chef_de_projet}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* Section Statut et descriptif */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Statut et descriptif</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Statut<span style={{ color: 'red' }}> *</span></label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Descriptif<span style={{ color: 'red' }}> *</span></label>
              <textarea
                name="descriptif"
                value={formData.descriptif}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded ${errors.descriptif ? 'border-danger' : ''}`}
                rows="5"
              ></textarea>
              {errors.descriptif && <p className="text-red-500 text-sm text-danger">{errors.descriptif}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/projets')}
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

export default ProjetForm;