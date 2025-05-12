import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import "../assets/styles/PersonForm.css";
import api from "../api/api";

const PersonForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [personnesList, setPersonnesList] = useState([]);
  const [projetsList, setProjetsList] = useState([]);

  const [formData, setFormData] = useState({
    matricule: '', first_name: '', last_name: '', email: '', telephone: '', sexe: '',role: '',
    position: '', status: '', diplome: '', specialite_diplome: '', dt_Embauche: '',
    dt_Debut_Carriere: '', experience_total: '', experience_expleo: '',
    manager: '', backup: '', projet: '', photo: null, ddc: null, is_active: false,
    existing_photo: '',
    existing_ddc: '',
    groups: [], user_permissions: [],
  });
  useEffect(() => {
    api.get('/personne/personnes/').then(res => setPersonnesList(res.data));
    api.get('/projet/projets/').then(res => setProjetsList(res.data));
  }, []); 

  useEffect(() => {
  if (isEditMode) {
    api.get(`/personne/personnes/${id}/`)
      .then((res) => {
        const data = res.data;
        // Convertir les valeurs null en chaînes vides
        const formattedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key, 
            value === null ? '' : value
          ])
        );

         // Stocker les chemins existants des fichiers
          setFormData({
            ...formattedData,
            existing_photo: data.photo || '',
            existing_ddc: data.ddc || ''
          });
      })
      .catch(() => {
        toast.error("Collaborateur non trouvé");
        navigate('/collaborateurs');
      });
  }
}, [id, isEditMode, navigate]);

 const handleChange = (e) => {
  const { name, value, type, files, checked } = e.target;
  
  if (type === "file") {
    const file = files[0];
    setFormData((prev) => ({ 
      ...prev, 
      [name]: file,
      [`existing_${name}`]: file ? '' : prev[`existing_${name}`]
    }));
  } else {
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['matricule', 'first_name', 'last_name', 'email','role', 'sexe', 'position', 'status', 'manager'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Champs manquants : ${field}`);
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
    }

   
    
    // Ajouter tous les champs sauf les fichiers
    const payload = new FormData();
    const cleanedFormData = { ...formData };
    delete cleanedFormData.groups;
    delete cleanedFormData.user_permissions;
    delete cleanedFormData.existing_photo; // Ensure these are not sent as regular fields
    delete cleanedFormData.existing_ddc;   // Ensure these are not sent as regular fields

    // Champs normaux (sauf fichiers et existing paths)
    Object.keys(cleanedFormData).forEach(key => {
      if (['photo', 'ddc'].includes(key)) return;
      if (cleanedFormData[key] !== null && cleanedFormData[key] !== undefined && cleanedFormData[key] !== '') {
        payload.append(key, cleanedFormData[key]);
      }
    });

    // Gérer les fichiers - Only append if a new file is selected
    if (formData.photo instanceof File) {
      payload.append('photo', formData.photo);
    }

    if (formData.ddc instanceof File) {
      payload.append('ddc', formData.ddc);
    }

    
    if (!isEditMode) {
      payload.append("password", formData.matricule); // mot de passe = matricule
    }

    try {
      if (isEditMode) {
        for (let [key, value] of payload.entries()) {
          console.log(`${key}:`, value);
        }
        await api.put(`/personne/personnes/${id}/`, payload,{
          headers: {'Content-Type': 'multipart/form-data'},
        });
        
        toast.success("Collaborateur mis à jour");
      } else {
        await api.post(`/personne/personnes/`, payload, {
          headers: {'Content-Type': 'multipart/form-data'}
        });
        toast.success("Collaborateur ajouté");
      }
      navigate('/collaborateurs');
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error.response?.data || error.message);
    }
  };

 return (
    <form onSubmit={handleSubmit}>
      <h2>🧍 Informations personnelles</h2>
      <label>Compte actif ?</label>
      <br/>
      <input
        id='is_active'
        type="checkbox"
        name="is_active"
        checked={formData.is_active}
        onChange={(e) =>
          setFormData({ ...formData, is_active: e.target.checked })
        }
      />
      <br />

      <label>Matricule</label>
      <input type="text" name="matricule" value={formData.matricule} onChange={handleChange} required />

      <label>Prénom</label>
      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required/>

      <label>Nom</label>
      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required/>

      <label>Sexe</label>
      <select name="sexe" value={formData.sexe} onChange={handleChange} required>
        <option value="">-- Sélectionner --</option>
        <option value="Homme">Homme</option>
        <option value="Femme">Femme</option>
      </select>

      <label>Email</label>
      <input type="email" name="email" value={formData.email} onChange={handleChange} required/>

      <label>Téléphone</label>
      <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} />

      <label>Rôle</label>
      <select name="role" value={formData.role} onChange={handleChange} required>
        <option value=''>-- Choisir un rôle --</option>
        <option value="COLLABORATEUR">Collaborateur</option>
        <option value="TL1">Team Leader N1</option>
        <option value="TL2">Team Leader N2</option>
      </select>

      <hr />

      <h2>📅 Informations professionnelles</h2>
      <label>Date début carrière</label>
      <input type="date" name="dt_Debut_Carriere" value={formData.dt_Debut_Carriere} onChange={handleChange} />

      <label>Date embauche</label>
      <input type="date" name="dt_Embauche" value={formData.dt_Embauche} onChange={handleChange} required/>

      <label>Position</label>
      <select name="position" value={formData.position} onChange={handleChange} required>
        <option value=''>-- Choisir une position --</option>
        {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6'].map(pos => (
          <option key={pos} value={pos}>{pos}</option>
        ))}
      </select>

      <label>Status</label>
      <select name="status" value={formData.status} onChange={handleChange} required>
        <option value=''>-- Choisir une status --</option>
        {['En formation', 'En cours', 'Bench', 'Out', 'Management', 'Stage'].map(stat => (
          <option key={stat} value={stat}>{stat}</option>
        ))}
      </select>

      <hr />

      <h2>🎓 Diplômes</h2>
      <label>Diplôme</label>
      <select name="diplome" value={formData.diplome} onChange={handleChange}>
        <option value=''>-- Choisir Diplôme --</option>
        <option value="Bac+2">Bac+2</option>
        <option value="Bac+3">Bac+3</option>
        <option value="Bac+5">Bac+5</option>
      </select>

      <label>Spécialité du diplôme</label>
      <input type="text" name="specialite_diplome" value={formData.specialite_diplome} onChange={handleChange} />

      <hr />

      <h2>📁 Projet et reporting</h2>

      <label>Manager</label>
      <select
        name="manager"
        value={formData.manager?.matricule || ''} // Si l'API retourne un objet
        onChange={handleChange}
        required
      >
        <option value="">-- Choisir un manager --</option>
        {personnesList.map(p => (
          <option key={p.matricule} value={p.matricule}>
            {p.first_name} {p.last_name}
          </option>
        ))}
      </select>

      <label>Backup</label>
      <select
        name="backup"
        value={formData.backup?.matricule || ''}
        onChange={handleChange}
      >
        <option value="">-- Choisir un backup --</option>
        {personnesList.map(p => (
          <option key={p.matricule} value={p.matricule}>
            {p.first_name} {p.last_name}
          </option>
        ))}
      </select>

      <label>Projet</label>
      <select
        name="projet"
        value={formData.projet?.id || ''}
        onChange={handleChange}
      >
        <option value="">-- Choisir un projet --</option>
        {projetsList.map(projet => (
          <option key={projet.id} value={projet.id}>
            {projet.nom}
          </option>
        ))}
      </select>

      <hr />

      <h2>📎 Fichiers</h2>
      <label>Photo</label>
       <div>
        {formData.existing_photo && (
          <p>Fichier actuel : {formData.existing_photo}</p>
        )}
        <input 
          type="file" 
          name="photo" 
          onChange={handleChange} 
          accept="image/*" 
        />
      </div>

      <label>DDC</label>
      <div>
        {formData.existing_ddc && (
          <p>Fichier actuel : {formData.existing_ddc}</p>
        )}
        <input 
          type="file" 
          name="ddc" 
          onChange={handleChange} 
          accept=".doc,.docx" 
        />
      </div>

      <hr />

      <button variant="secondary" onClick={() => navigate('/collaborateurs')}>Annuler</button>
      <button type="submit" variant="primary">
        {isEditMode ? 'Mettre à jour' : 'Ajouter'}
      </button>
      
    </form>
  );
}

export default PersonForm;
