import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from "../../api/api";
import styles from '../../assets/styles/Form.module.css';

const EquipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const [formData, setFormData] = useState({
    name: '',
    assigned_users: [],
  });

  const [errors, setErrors] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom de l'équipe est requis.";
    return newErrors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await api.get('/personne/personnes/');
        setAllUsers(usersRes.data);

        if (isEditMode) {
          const res = await api.get(`/equipes/${id}/`);
          setFormData({
            name: res.data.name,
            assigned_users: res.data.assigned_users || [],
          });
        }
      } catch (err) {
        toast.error("Erreur lors du chargement des données.");
        console.error(err);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let option of options) {
      if (option.selected) selected.push(option.value);
    }
    setFormData(prev => ({
      ...prev,
      assigned_users: selected
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        if (isEditMode) {
          await api.put(`/equipes/${id}/`, formData);
          toast.success("Équipe mise à jour avec succès");
        } else {
          await api.post(`/equipes/`, formData);
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
              <label htmlFor="assigned_users" className={styles.formLabel}>
                Membres assignés
              </label>
              <select
                id="assigned_users"
                name="assigned_users"
                multiple
                value={formData.assigned_users}
                onChange={handleSelectChange}
                className={styles.formControl}
              >
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </select>
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
