import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Données mock – tableau importé côté liste
import { trainings as mockTrainings } from '../../../data/trainings';

import styles from '../../../assets/styles/Form.module.css';

/**
 * Formulaire de création / édition d'une formation
 * — Inspiré du composant PersonForm fourni par l'utilisateur
 * — AUCUN appel API : on lit / écrit directement dans le tableau `mockTrainings`
 */
const TrainingForm = () => {
  const navigate   = useNavigate();
  const { id }     = useParams();           // id de la formation
  const isEditMode = id !== undefined;

  /* -------------------------------------------------- */
  /*                    ÉTAT PRINCIPAL                  */
  /* -------------------------------------------------- */
  const [formData, setFormData] = useState({
    id:           '',
    title:        '',
    department:   '',
    intro:        '',
    duration:     '', // en minutes (nombre)
    createdBy:    '',
    cover:        null, // fichier ou URL
    status:       'draft',
  });

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------- */
  /*            CHARGEMENT DES DONNÉES SI EDIT          */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (isEditMode) {
      const existing = mockTrainings.find(t => t.id.toString() === id);
      if (!existing) {
        toast.error('Formation introuvable');
        navigate('/manager/trainings');
        return;
      }

      setFormData({
        id:         existing.id,
        title:      existing.title,
        department: existing.department,
        intro:      existing.intro,
        duration:   existing.duration,
        createdBy:  existing.createdBy,
        cover:      existing.cover,
        status:     existing.status,
      });
    }
  }, [id, isEditMode, navigate]);

  /* -------------------------------------------------- */
  /*                 VALIDATION RAPIDE                  */
  /* -------------------------------------------------- */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title)      newErrors.title      = 'Le titre est requis.';
    if (!formData.department) newErrors.department = 'Le département est requis.';
    if (!formData.intro)      newErrors.intro      = 'L\'introduction est requise.';
    if (!formData.createdBy)  newErrors.createdBy  = 'Le créateur est requis.';
    if (!formData.duration || isNaN(formData.duration) || formData.duration <= 0)
      newErrors.duration = 'La durée doit être un nombre positif (minutes).';
    return newErrors;
  };

  /* -------------------------------------------------- */
  /*                HANDLERS DE CHAMP                   */
  /* -------------------------------------------------- */
  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  /* -------------------------------------------------- */
  /*                    SUBMISSION                      */
  /* -------------------------------------------------- */
  const handleSubmit = e => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      if (isEditMode) {
        // Mettre à jour l'élément dans le tableau mock
        const idx = mockTrainings.findIndex(t => t.id.toString() === id);
        if (idx !== -1) {
          mockTrainings[idx] = {
            ...mockTrainings[idx],
            ...formData,
            cover:
              formData.cover instanceof File
                ? URL.createObjectURL(formData.cover)
                : formData.cover,
          };
          toast.success('Formation mise à jour');
        }
      } else {
        // Générer un nouvel ID (simple incrément)
        const newId = mockTrainings.length ? Math.max(...mockTrainings.map(t => t.id)) + 1 : 1;
        const newTraining = {
          ...formData,
          id: newId,
          duration: Number(formData.duration),
          cover:
            formData.cover instanceof File
              ? URL.createObjectURL(formData.cover)
              : formData.cover || '',
          chapters:   [],
          resources:  [],
          quiz:       { totalScore: 0, completed: false, questions: [] },
          progress:   0,
          tabsCompleted: { overview: false, chapters: false, resources: false, quiz: false },
        };
        mockTrainings.push(newTraining);
        toast.success('Formation créée');
      }

      navigate('/manager/trainings');
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------- */
  /*                         UI                         */
  /* -------------------------------------------------- */
  return (
    <div className="container py-5">
      <h1 className={`${styles.formTitle} mb-5 text-center`}>
        {isEditMode ? 'Modifier une formation' : 'Créer une nouvelle formation'}
      </h1>

      <form onSubmit={handleSubmit} className={styles.projetFormCard}>
        {/* Titre et Département */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Titre <span style={{ color: 'red' }}> *</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.title ? styles.inputError : ''}`}
              />
              {errors.title && <p className={styles.errorText}>{errors.title}</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Département <span style={{ color: 'red' }}> *</span></label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.department ? styles.inputError : ''}`}
              >
                <option value="">-- Choisir --</option>
                {['ME', 'IT', 'HR', 'OPS'].map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
              {errors.department && <p className={styles.errorText}>{errors.department}</p>}
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Introduction <span style={{ color: 'red' }}> *</span></label>
              <textarea
                name="intro"
                value={formData.intro}
                onChange={handleChange}
                rows={4}
                className={`${styles.formControl} ${errors.intro ? styles.inputError : ''}`}
              />
              {errors.intro && <p className={styles.errorText}>{errors.intro}</p>}
            </div>
          </div>
        </div>

        {/* Durée + Créateur */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Durée (minutes) <span style={{ color: 'red' }}> *</span></label>
              <input
                type="number"
                name="duration"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.duration ? styles.inputError : ''}`}
              />
              {errors.duration && <p className={styles.errorText}>{errors.duration}</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Créé par <span style={{ color: 'red' }}> *</span></label>
              <input
                type="text"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleChange}
                placeholder="Nom et Prénom"
                className={`${styles.formControl} ${errors.createdBy ? styles.inputError : ''}`}
              />
              {errors.createdBy && <p className={styles.errorText}>{errors.createdBy}</p>}
            </div>
          </div>
        </div>

        {/* Couverture */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Image de couverture</label>
              <input
                type="file"
                name="cover"
                onChange={handleChange}
                className={styles.formControl}
                accept="image/*"
              />
              {isEditMode && typeof formData.cover === 'string' && (
                <div className="mt-2">
                  <img src={formData.cover} alt="cover" className="h-20 w-32 object-cover rounded" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className={`${styles.buttonGroup} d-flex justify-content-end`}>
          <button
            type="button"
            onClick={() => navigate('/manager/trainings')}
            className={`${styles.actionButton} ${styles.cancelButton} me-3`}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`${styles.actionButton} ${styles.submitButton}`}
          >
            {loading ? 'Enregistrement…' : isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainingForm;
