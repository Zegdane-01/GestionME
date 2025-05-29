import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Download, Upload, Video, File, HelpCircle } from 'lucide-react';

// Catalogue statique des formations
import { trainingCatalog } from '../../../data/trainingCatalog';

import styles from '../../../assets/styles/Form.module.css';

const TrainingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const emptyQuestion = () => ({ id: Date.now(), text: '', points: 0, options: ['', ''], correctIndex: 0 });
  const emptyChapter  = () => ({ id: Date.now(), title: '', videoUrl: '', description: '', completed: false });
  const emptyResource = () => ({ id: Date.now(), name: '', file: null, read: false });

  const [formData, setFormData] = useState({
    id: '', title: '', department: '', intro: '', duration: '', cover: null,
    status: 'new',
    chapters: [], resources: [],
    quiz: { totalScore: 0, completed: false, questions: [] }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const existing = trainingCatalog.find(t => t.id.toString() === id);
      if (!existing) { toast.error('Formation introuvable'); navigate('/manager/trainings'); return; }
      setFormData({
        ...existing,
        duration: existing.duration,
        chapters: existing.chapters.map(c => ({ ...c })),
        resources: existing.resources.map(r => ({ ...r })),
        quiz: {
          totalScore: existing.quiz.totalScore,
          completed: existing.quiz.completed,
          questions: existing.quiz.questions.map(q => ({ ...q }))
        }
      });
    }
  }, [id, isEditMode, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.title) errs.title = 'Titre requis';
    if (!formData.department) errs.department = 'Département requis';
    if (!formData.intro) errs.intro = 'Introduction requise';
    if (!formData.duration || formData.duration <= 0) errs.duration = 'Durée positive requise';
    return errs;
  };

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'file' ? files[0] : value }));
  };

  const handleChapterChange = (idx, field, value) => {
    const list = [...formData.chapters]; list[idx][field] = value;
    setFormData(prev => ({ ...prev, chapters: list }));
  };
  const addChapter = () => setFormData(prev => ({ ...prev, chapters: [...prev.chapters, emptyChapter()] }));
  const removeChapter = idx => setFormData(prev => ({ ...prev, chapters: prev.chapters.filter((_, i) => i !== idx) }));

  const handleResourceChange = (idx, field, value) => {
    const list = [...formData.resources];
    if (field === 'file') list[idx].file = value;
    else if (field === 'name') list[idx].name = value;
    setFormData(prev => ({ ...prev, resources: list }));
 };
  const addResource = () => setFormData(prev => ({ ...prev, resources: [...prev.resources, emptyResource()] }));
  const removeResource = idx => setFormData(prev => ({ ...prev, resources: prev.resources.filter((_, i) => i !== idx) }));

  const handleQuestionChange = (idx, field, value) => {
    const list = [...formData.quiz.questions]; list[idx][field] = value;
    setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, questions: list } }));
  };
  const addQuestion = () => setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, questions: [...prev.quiz.questions, emptyQuestion()] } }));
  const removeQuestion = idx => setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, questions: prev.quiz.questions.filter((_, i) => i !== idx) } }));

  const handleOptionChange = (qIdx, oIdx, value) => {
    const questions = [...formData.quiz.questions];
    questions[qIdx].options[oIdx] = value;
    setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, questions } }));
  };
  const addOption = qIdx => {
    const questions = [...formData.quiz.questions];
    questions[qIdx].options.push('');
    setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, questions } }));
  };
  const removeOption = (qIdx, oIdx) => {
    const questions = [...formData.quiz.questions];
    questions[qIdx].options.splice(oIdx,1);
    setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, questions } }));
  };
  const setCorrectIndex = (qIdx, oIdx) => {
    const questions = [...formData.quiz.questions];
    questions[qIdx].correctIndex = oIdx;
    setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, questions } }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const data = {
        ...formData,
        duration: Number(formData.duration),
        cover: formData.cover instanceof File ? URL.createObjectURL(formData.cover) : formData.cover,
        chapters: formData.chapters,
        resources: formData.resources,
        quiz: { totalScore: formData.quiz.totalScore, completed: formData.quiz.completed, questions: formData.quiz.questions }
      };
      if (isEditMode) {
        const idx = trainingCatalog.findIndex(t => t.id.toString()===id);
        trainingCatalog[idx] = data;
        toast.success('Formation mise à jour');
      } else {
        data.id = trainingCatalog.length ? Math.max(...trainingCatalog.map(t=>t.id))+1 : 1;
        trainingCatalog.push(data);
        toast.success('Formation créée');
      }
      navigate('/manager/trainings');
    } catch (err) {
      console.error(err); toast.error('Erreur');
    } finally { setLoading(false); }
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
            <label className={styles.formLabel}>
              Titre <span style={{ color: 'red' }}> *</span>
            </label>
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
            <label className={styles.formLabel}>
              Département <span style={{ color: 'red' }}> *</span>
            </label>
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
            <label className={styles.formLabel}>
              Introduction <span style={{ color: 'red' }}> *</span>
            </label>
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

      {/* Durée + Créé par */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Durée (minutes) <span style={{ color: 'red' }}> *</span>
            </label>
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
      </div>

      {/* Image de couverture */}
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
                <img
                  src={formData.cover}
                  alt="cover"
                  className="h-20 w-32 object-cover rounded"
                />
              </div>
            )}
          </div>
        </div>
      </div>

              {/* Chapitres - Style amélioré */}
        <div className={`${styles.formGroup} mb-4`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0 d-flex align-items-center">
              <Video size={20} className="me-2" /> Chapitres
            </h3>
            <button 
              type="button" 
              onClick={addChapter}
              className={`${styles.actionButton} btn-sm d-flex align-items-center`}
            >
              <Plus size={16} className="me-1" /> Ajouter
            </button>
          </div>
          
          {formData.chapters.map((c, i) => (
            <div key={c.id} className={`${styles.formControl} p-3 mb-3`}>
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  onClick={() => removeChapter(i)}
                  className="btn btn-sm btn-link text-danger p-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="mb-3">
                <label className={styles.formLabel}>Titre du chapitre</label>
                <input
                  type="text"
                  value={c.title}
                  placeholder="Introduction au module"
                  onChange={e => handleChapterChange(i, 'title', e.target.value)}
                  className={`${styles.formControl} mb-2`}
                />
              </div>
              
              <div className="mb-3">
                <label className={styles.formLabel}>URL de la vidéo</label>
                <input
                  type="text"
                  value={c.videoUrl}
                  placeholder="https://example.com/video.mp4"
                  onChange={e => handleChapterChange(i, 'videoUrl', e.target.value)}
                  className={`${styles.formControl} mb-2`}
                />
              </div>
              
              <div>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  value={c.description}
                  placeholder="Contenu détaillé du chapitre..."
                  onChange={e => handleChapterChange(i, 'description', e.target.value)}
                  className={`${styles.formControl}`}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Ressources - Style amélioré */}
        <div className={`${styles.formGroup} mb-4`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0 d-flex align-items-center">
              <File size={20} className="me-2" /> Ressources
            </h3>
            <button 
              type="button" 
              onClick={addResource}
              className={`${styles.actionButton} btn-sm d-flex align-items-center`}
            >
              <Plus size={16} className="me-1" /> Ajouter
            </button>
          </div>
          
          {formData.resources.map((r, i) => (
            <div key={r.id} className={`${styles.formControl} p-3 mb-3`}>
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  onClick={() => removeResource(i)}
                  className="btn btn-sm btn-link text-danger p-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className={styles.formLabel}>Nom de la ressource</label>
                  <input
                    type="text"
                    value={r.name}
                    placeholder="Le nom du fichier"
                    onChange={e => handleResourceChange(i, 'name', e.target.value)}
                    className={`${styles.formControl} mb-2`}
                  />
                </div>
                
                
                <div className="col-md-12">
                  <label className={styles.formLabel}>Fichier</label>
                  <div className="input-group">
                    <input
                      type="file"
                      onChange={e => handleResourceChange(i, 'file', e.target.files[0])}
                      className={styles.formControl}
                      accept="*/*"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quiz - Style amélioré */}
        <div className={`${styles.formGroup} mb-4`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0 d-flex align-items-center">
              <HelpCircle size={20} className="me-2" /> Quiz
            </h3>
            <button 
              type="button" 
              onClick={addQuestion}
              className={`${styles.actionButton} btn-sm d-flex align-items-center`}
            >
              <Plus size={16} className="me-1" /> Ajouter
            </button>
          </div>
          
          {formData.quiz.questions.map((q, i) => (
            <div key={q.id} className={`${styles.formControl} p-3 mb-3`}>
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  onClick={() => removeQuestion(i)}
                  className="btn btn-sm btn-link text-danger p-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="mb-3">
                <label className={styles.formLabel}>Question</label>
                <input
                  type="text"
                  value={q.text}
                  placeholder="Quelle est la capitale de la France ?"
                  onChange={e => handleQuestionChange(i, 'text', e.target.value)}
                  className={`${styles.formControl} mb-2`}
                />
              </div>
              
              <div className="mb-3">
                <label className={styles.formLabel}>Points</label>
                <input
                  type="number"
                  value={q.points}
                  min="1"
                  placeholder="10"
                  onChange={e => handleQuestionChange(i, 'points', Number(e.target.value))}
                  className={`${styles.formControl} mb-2`}
                />
              </div>
              
              <label className={styles.formLabel}>Options</label>
              {q.options.map((opt, oi) => (
                <div key={oi} className="d-flex align-items-center mb-2">
                  <input
                    type="text"
                    value={opt}
                    placeholder={`Option ${oi + 1}`}
                    onChange={e => handleOptionChange(i, oi, e.target.value)}
                    className={`${styles.formControl} me-2`}
                  />
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oi}
                    onChange={() => setCorrectIndex(i, oi)}
                    className="me-2"
                  />
                  <span className="me-2 small">Correct</span>
                  <button
                    type="button"
                    onClick={() => removeOption(i, oi)}
                    className="btn btn-sm btn-link text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addOption(i)}
                className={`${styles.actionButton} btn-sm d-flex align-items-center`}
              >
                <Plus size={16} className="me-1" /> Ajouter une option
              </button>
            </div>
          ))}
        </div>

      {/* Boutons d'action */}
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
