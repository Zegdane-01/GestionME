import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../../api/api';
import styles from '../../../assets/styles/Form.module.css';
import { image } from 'framer-motion/client';

const emptyModule    = () => ({ titre: '', description: '', video: null, estimated_time: '00:00:00' });
const emptyResource  = () => ({ name: '', file: null, confidentiel: false, estimated_time: '00:00:00' });
const emptyOption    = () => ({ texte: '', is_correct: false });
const emptyQuestion  = () => ({ texte: '', type: 'single_choice', point: 1, options: [emptyOption()], correct_raw:'', image: null });
const emptyQuiz      = () => ({ estimated_time: '00:00:00', questions: [emptyQuestion()] });

const userData = JSON.parse(localStorage.getItem('userData'));
const accessToken = localStorage.getItem('accessToken');
const userId = userData?.matricule; 

const TrainingForm = () => {
  /* --- routing / mode --- */
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate   = useNavigate();

  /* --- général --- */
  const [domains, setDomains] = useState([]);
  const [existingCover, setExistingCover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  /* --- state formulaire --- */
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    domain: '',
    statut: 'inactif',
    image_cover: null,
    modules:    [],          // ← vide
    ressources: [],          // ← vide
    quiz:       null,        // ← null (pas encore créé)
  });

  const [showModules,    setShowModules]    = useState(false);
  const [showResources,  setShowResources]  = useState(false);
  const [showQuiz,       setShowQuiz]       = useState(false);

   /* ----------- helper affichage erreur ---------- */
  const getError = key => errors[key] ?? null;


  /* change le type d’une question */
  const setQuestionType = (qIdx, newType) => {
    setFormData(prev => {
      const questions = [...prev.quiz.questions];
      let q = { ...questions[qIdx], type: newType };

      if (newType === 'single_choice') {
        // 1️⃣  s’assurer qu’il n’y a qu’une seule réponse correcte
        let alreadyTrue = false;
        q.options = q.options.map(opt => {
          if (opt.is_correct) {
            if (alreadyTrue) return { ...opt, is_correct: false };
            alreadyTrue = true;
          }
          return opt;
        });
        // Si AUCUNE option n’est correcte, on coche la première
        if (!alreadyTrue && q.options.length) q.options[0].is_correct = true;
      }

      // (Re)création d’au moins une option pour les types à choix
      if (
        (newType === 'single_choice' || newType === 'multiple_choice') &&
        q.options.length === 0
      ) {
        q.options = [emptyOption()];
      }

      // Suppression d'options si on passe à text/image_text
      if (newType === 'text' || newType === 'image_text') {
        q.options = [];
        if (newType === 'image_text') {
          q.image = null;
          q.correct_keywords = [];
          q.correct_raw = '';
        }
      }

      questions[qIdx] = q;
      return { ...prev, quiz: { ...prev.quiz, questions } };
    });
  };


  /* toggle correct / radio-style pour single_choice */
  const toggleOptionCorrect = (qIdx, oIdx) => {
    setFormData(prev => {
      const questions = [...prev.quiz.questions];
      const q = { ...questions[qIdx] };
      const opts = q.options.map((o, i) =>
        q.type === 'single_choice'
          ? { ...o, is_correct: i === oIdx }      // radio
          : i === oIdx
            ? { ...o, is_correct: !o.is_correct } // checkbox
            : o
      );
      q.options = opts;
      questions[qIdx] = q;
      return { ...prev, quiz: { ...prev.quiz, questions } };
    });
  };


  /* ------------------------------------------------------------ */
  /*              1.  Chargement des domaines + édition            */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const { data } = await api.get('/domains/');
        setDomains(data);

        if (isEditMode) {
          const { data: training } = await api.get(`/formations/${id}/`);
          setExistingCover(training.image_cover);
          // L'API renvoie déjà modules / ressources / quiz imbriqués
          setFormData({
            ...training,
            domain: training.domain ?? '',
            image_cover: null, // pour ne pas ré-afficher le fichier

          });
          setShowModules(training.modules.length > 0);
          setShowResources(training.ressources.length > 0);
          setShowQuiz(training.quiz !== null);
        }
      } catch (err) {
        toast.error('Impossible de charger les données');
        console.error(err);
      }
    };
    fetchInit();
  }, [id, isEditMode]);

  /* ------------------------------------------------------------ */
  /*                 2. Handlers généraux                          */
  /* ------------------------------------------------------------ */
  const handleSimpleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  /* ---------- modules ---------- */
  const handleModuleChange = (index, field, value) => {
    const updated = [...formData.modules];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, modules: updated }));
  };
  const addModule    = () => setFormData(p => ({ ...p, modules: [...p.modules, emptyModule()] }));
  const removeModule = (idx) => {
    setFormData(p => {
      const mod = p.modules.filter((_,i)=>i!==idx);
      return {...p, modules: mod};
    });
    if (formData.modules.length === 1) setShowModules(false);
  };

  /* ---------- ressources ---------- */
  const handleResourceChange = (index, field, value) => {
    const updated = [...formData.ressources];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, ressources: updated }));
  };
  const addResource    = () => setFormData(p => ({ ...p, ressources: [...p.ressources, emptyResource()] }));
  const removeResource = (idx) => {
    setFormData(p => {
      const res = p.ressources.filter((_,i)=>i!==idx);
      return {...p, ressources: res};
    });
    if (formData.ressources.length === 1) setShowResources(false);
  };

  /* ---------- quiz / questions / options ---------- */
  const handleQuizField = (field, value) => {
    setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, [field]: value } }));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const questions = [...formData.quiz.questions];
    questions[qIdx][field] = value;
    setFormData(p => ({ ...p, quiz: { ...p.quiz, questions } }));
  };

  const handleOptionChange = (qIdx, oIdx, field, value) => {
    const questions = [...formData.quiz.questions];
    questions[qIdx].options[oIdx][field] = value;
    setFormData(p => ({ ...p, quiz: { ...p.quiz, questions } }));
  };

  const addQuestion = () =>
    setFormData(p => ({ ...p, quiz: { ...p.quiz, questions: [...p.quiz.questions, emptyQuestion()] } }));

  const removeQuestion = (qIdx) => {
    setFormData(prev => {
      const remaining = prev.quiz.questions.filter((_, i) => i !== qIdx);

      /* -- 1.  S'il reste encore des questions, on les conserve -- */
      if (remaining.length > 0) {
        return {
          ...prev,
          quiz: { ...prev.quiz, questions: remaining }
        };
      }

      /* -- 2.  Sinon, on supprime complètement le quiz -- */
      setShowQuiz(false);        // masque la section
      return {
        ...prev,
        quiz: null               // enlève le quiz du payload
      };
    });
  };

  const addOption = (qIdx) => {
    const questions = [...formData.quiz.questions];
    questions[qIdx].options.push(emptyOption());
    setFormData(p => ({ ...p, quiz: { ...p.quiz, questions } }));
  };

  const removeOption = (qIdx, oIdx) => {
    setFormData(prev => {
      const questions = [...prev.quiz.questions];
      const opts = questions[qIdx].options;

      if (opts.length === 1) {
        toast.error('Au moins une option est requise.');
        return prev;
      }
      questions[qIdx].options = opts.filter((_, i) => i !== oIdx);
      return { ...prev, quiz: { ...prev.quiz, questions } };
    });
  };

  /* ------------------------------------------------------------ */
  /*                 3. Validation très légère                     */
  /* ------------------------------------------------------------ */
  const validate = () => {
    const e = {};
    const hasCover = existingCover || formData.image_cover;

    /* ---------- Formation (toujours obligatoires) ---------- */
    if (!formData.titre.trim())         e.titre        = 'Titre requis';
    if (!formData.description.trim())   e.description  = 'Description requise';
    if (!formData.domain)               e.domain       = 'Domaine requis';
   
    if (!hasCover) e.image_cover = 'Image de couverture requise';


    /* ---------- Modules (seulement si showModules = true) ---------- */
    if (showModules) {
      if (formData.modules.length === 0) {
        e.modules = 'Ajouter au moins un module';
      }
      formData.modules.forEach((m, i) => {
        if (!m.titre.trim() || !m.description.trim() || !m.video || !m.estimated_time.trim()) {
          e[`module${i}`] = 'Tous les champs du module sont obligatoires';
        }
      });
    }

    /* ---------- Ressources (seulement si showResources = true) ---------- */
    if (showResources) {
      if (formData.ressources.length === 0) {
        e.ressources = 'Ajouter au moins une ressource';
      }
      formData.ressources.forEach((r, i) => {
        if (!r.name.trim() || !r.file || !r.estimated_time.trim()) {
          e[`ress${i}`] = 'Tous les champs de la ressource sont obligatoires';
        }
      });
    }

    /* ---------- Quiz (seulement si showQuiz = true) ---------- */
    if (showQuiz) {
      if (!formData.quiz) {
        e.quiz = 'Le quiz est obligatoire';
      } else {
        if (!formData.quiz.estimated_time.trim()) {
          e.quizTime = 'Temps estimé requis';
        }
        if (formData.quiz.questions.length === 0) {
          e.quizQuestions = 'Ajouter au moins une question';
        }

        formData.quiz.questions.forEach((q, qi) => {
          if (!q.texte.trim()) e[`q${qi}`] = 'Texte question requis';

          /* single / multiple */
          if (['single_choice', 'multiple_choice'].includes(q.type)) {
            if (q.options.length === 0 || q.options.some(o => !o.texte.trim())) {
              e[`q${qi}opt`] = 'Toutes les options sont obligatoires';
            }
            if (
              q.type === 'single_choice' &&
              q.options.filter(o => o.is_correct).length !== 1
            ) {
              e[`q${qi}opt`] = 'Une seule option doit être correcte';
            }
          }

          /* image_text */
          if (q.type === 'image_text') {
            if (!q.image) {
              e[`q${qi}img`] = 'Image requise';
            }
            // Validate based on correct_raw, which holds the user's comma-separated input
            const keywordsEntered = (q.correct_raw || '')
              .split(',')
              .map(k => k.trim())
              .filter(Boolean);
            if (!keywordsEntered.length) {
              e[`q${qi}kw`]  = 'Un mot-clé minimum requis';
            }
          }
        });
      }
    }

    return e;
  };


  /* ------------------------------------------------------------ */
  /*                 4. Submit                                    */
  /* ------------------------------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      /* transformer en FormData */
      const fd = new FormData();
      // simples
      ['titre','description','domain','statut'].forEach(k => fd.append(k, formData[k]));
      if(userId) fd.append('created_by', userId); // si utilisateur connecté
      if (existingCover) {
        // aucun changement : ne rien mettre dans FormData → on garde la même image
      } else if (formData.image_cover) {
        fd.append('image_cover', formData.image_cover);   // nouvelle image
      } else {
        // existingCover supprimée et pas de nouvelle → envoyer '' pour effacer
        fd.append('image_cover', '');
      }

      // modules
      const modMeta = formData.modules.map((m, i) => {
        if (m.video instanceof File) {
          fd.append(`module_video_${i}`, m.video);           // le vrai fichier
          return { ...m, video: `module_video_${i}` };       // pointeur texte
        }
        return m;
      });
      fd.append('modules', JSON.stringify(modMeta));
      // ressources : on envoie metadata + fichiers
      const resMeta = formData.ressources.map((r,i) => {
        if (r.file instanceof File) fd.append(`ressource_file_${i}`, r.file);
        return { ...r, file: r.file instanceof File ? `ressource_file_${i}` : r.file };
      });
      fd.append('ressources', JSON.stringify(resMeta));

      // quiz
      if (formData.quiz && showQuiz) {
        const quizCopy = {
          estimated_time: formData.quiz.estimated_time,
          questions: []
        };


        formData.quiz.questions.forEach((origQ, idx) => {
          const q = { ...origQ };              // shallow copy : garde le File
          if (q.type === 'image_text') {
            /* -------- image -------- */
            if (q.image instanceof File) {
              const key = `question_image_${idx}`;
              fd.append(key, q.image);         // ① on ajoute le fichier
              q.image = key;                   // ② on remplace par la clé
            } else {
              q.image = null;                  // aucune image sélectionnée
            }

            /* ------ keywords ------- */
            q.correct_keywords = (q.correct_raw || '')
              .split(',')
              .map(s => s.trim())
              .filter(Boolean);
            delete q.correct_raw;
          } else {
            delete q.image;
            delete q.correct_raw;
          }

          quizCopy.questions.push(q);
        });

        fd.append('quiz', JSON.stringify(quizCopy));
      }
      if (isEditMode) {
        await api.put(`/formations/${id}/`, fd, { headers:{'Content-Type':'multipart/form-data'} });
        toast.success('Formation mise à jour');
      } else {
        await api.post('/formations/', fd, { 
          Authorization: `Bearer ${accessToken}`,
          headers:{'Content-Type':'multipart/form-data'} 
        });
        toast.success('Formation créée');
      }
      navigate('/manager/trainings');
    } catch (err) {
      if (err.response) {
        console.error('Validation errors →', err.response.data);
        toast.error('Validation errors →', err.response.data);
      } else {
        console.error(err);
        toast.error('Erreur réseau');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------ */
  /*                 5. Render                                    */
  /* ------------------------------------------------------------ */
  return (
    <div className="container py-5">
      <h1 className={`${styles.formTitle} mb-5 text-center`}>
        {isEditMode ? 'Modifier une formation' : 'Créer une formation'}
      </h1>

      <form onSubmit={handleSubmit} className={styles.projetFormCard}>

        {/* ----------- Infos principales ---------- */}
        <div className="mb-4">
          <label className={styles.formLabel}>Titre<span className="text-danger">*</span></label>
          <input
            name="titre"
            value={formData.titre}
            onChange={handleSimpleChange}
            className={`${styles.formControl} ${getError('titre') ? styles.inputError : ''}`}
          />
          {getError('titre') && <p className={styles.errorText}>{getError('titre')}</p>}
        </div>

        <div className="mb-4">
          <label className={styles.formLabel}>Description<span className="text-danger">*</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleSimpleChange}
            className={`${styles.formControl} ${getError('description') ? styles.inputError : ''}`}
            rows={3}
          />
          {getError('description') && <p className={styles.errorText}>{getError('description')}</p>}
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className={styles.formLabel}>Domaine<span className="text-danger">*</span></label>
            <select
              name="domain"
              value={formData.domain}
              onChange={handleSimpleChange}
              className={`${styles.formControl} ${getError('domain') ? styles.inputError : ''}`}
            >
              <option value="">-- Sélectionner --</option>
              {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {getError('domain') && <p className={styles.errorText}>{getError('domain')}</p>}
          </div>

          <div className="col-md-6">
            <label className={styles.formLabel}>Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleSimpleChange}
              className={styles.formControl}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className={styles.formLabel}>Image de couverture<span className="text-danger">*</span></label>

          {existingCover && (
            <div className="mb-2">
              <img src={existingCover} alt="Couverture actuelle" className="img-thumbnail" style={{maxWidth:140}} />
            </div>
          )}


          <input
            id="image_cover"
            type="file"
            name="image_cover"
            onChange={handleSimpleChange}
            className={`${styles.formControl} ${getError('image_cover') ? styles.inputError : ''}`}
          />

          {getError('image_cover') && <p className={styles.errorText}>{getError('image_cover')}</p>}
        </div>

        {/* ----------------- Modules --------------- */}
        <h4 className="mt-5 d-flex align-items-center">
          Modules
          {!showModules && (
            <button type="button" className="btn btn-sm btn-primary ms-3"
                    onClick={() => { setShowModules(true); addModule(); }}>
              + Ajouter
            </button>
          )}
        </h4>
        {showModules && (
          <>
            {formData.modules.map((m, idx) => {
              const modErr   = getError(`module${idx}`);
              const hasErr   = Boolean(modErr);
              return (

              <div key={idx} className="border p-3 mb-3 rounded">
                <div className="row g-2">
                  <div className="col-md-12">
                    <label htmlFor={`module-${idx}-titre`} className={styles.formLabel}>Titre module<span className="text-danger">*</span></label>
                    <input
                    id={`mod-${idx}-titre`}
                    value={m.titre}
                    onChange={e => handleModuleChange(idx, 'titre', e.target.value)}
                    className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                  />
                  </div>
                </div>
                <div className="row mt-3 g-2">
                  <div className="col-md-12">
                    <label htmlFor={`module-${idx}-video`} className={styles.formLabel}>Vidéo<span className="text-danger">*</span></label>
                    {isEditMode && m.video && typeof m.video === 'string' && (
                      <a href={m.video} target="_blank" rel="noopener noreferrer">Vidéo existante</a>
                    )}
                    <input
                    id={`mod-${idx}-video`}
                    type="file"
                    accept="video/*"
                    onChange={e => handleModuleChange(idx, 'video', e.target.files[0])}
                    className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                  />
                  </div>
                </div>
                
                <div className="row mt-3 g-2">

                  <div className="col-12 mt-2">
                    <label htmlFor={`module-${idx}-description`} className={styles.formLabel}>Description<span className="text-danger">*</span></label>
                    <textarea
                    id={`mod-${idx}-desc`}
                    value={m.description}
                    onChange={e => handleModuleChange(idx, 'description', e.target.value)}
                    className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                    rows={2}
                  />
                  </div>
                </div>

                <div className="row mt-3 g-2 mb-4" >

                  <div className="col-md-4">
                    <label htmlFor={`module-${idx}-time`} className={styles.formLabel}>Temps estimé (HH:MM:SS)<span className="text-danger">*</span></label>
                    <input
                    id={`mod-${idx}-time`}
                    value={m.estimated_time}
                    onChange={e => handleModuleChange(idx, 'estimated_time', e.target.value)}
                    className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                  />
                  </div>
                </div>
                {modErr && <p className={styles.errorText}>{modErr}</p>}
                <button type="button" className="btn btn-sm btn-danger mt-2" onClick={() => removeModule(idx)}>
                  Supprimer module
                </button>
              </div>
              );
        })}
            <button type="button" className="btn btn-primary mb-4" onClick={addModule}>+ Module</button>
          </>
        )}

        {/* ----------------- Ressources --------------- */}
        <h4 className="mt-5 d-flex align-items-center">
          Ressources
          {!showResources && (
            <button type="button" className="btn btn-sm btn-primary ms-3"
                    onClick={() => { setShowResources(true); addResource(); }}>
              + Ajouter
            </button>
          )}
        </h4>
          {showResources && (
            <>
              {formData.ressources.map((r, idx) => {
                const modErr   = getError(`ress${idx}`);
                const hasErr   = Boolean(modErr);
                return (
                <div key={idx} className="border p-3 mb-3 rounded">
                  <div className="row g-2">
                    <div className="col-md-12">
                      <label htmlFor={`res-${idx}-name`} className={styles.formLabel}>Nom ressource<span className="text-danger">*</span></label>
                      <input
                        id={`res-${idx}-name`}
                        placeholder="Nom ressource"
                        value={r.name}
                        onChange={e => handleResourceChange(idx, 'name', e.target.value)}
                        className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                      />
                    </div>
                  </div>
                  <div className="row mt-3 g-2">

                    <div className="col-md-12">
                      <label htmlFor={`res-${idx}-file`} className={styles.formLabel}>Fichier<span className="text-danger">*</span></label>
                      {isEditMode && r.file && typeof r.file === 'string'  && (
                        <a href={r.file} target="_blank" rel="noopener noreferrer">Fichier existant</a>
                      )}
                      <input
                        id={`res-${idx}-file`}
                        type="file"
                        onChange={e => handleResourceChange(idx, 'file', e.target.files[0])}
                        className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                      />
                    </div>
                  </div>
                  <div className="row mt-3 g-2">

                    <div className="col-md-4">
                      <label htmlFor={`res-${idx}-time`} className={styles.formLabel}>Temps estimé (HH:MM:SS)<span className="text-danger">*</span></label>
                      <input
                        id={`res-${idx}-time`}
                        placeholder="Durée (HH:MM:SS)"
                        value={r.estimated_time}
                        onChange={e => handleResourceChange(idx, 'estimated_time', e.target.value)}
                        className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                      />
                    </div>

                  </div>
                  <div className="row mt-3 g-2 mb-4">

                    <div className="col-md-3 d-flex align-items-center form-check form-switch">
                      <input
                        id={`res-${idx}-conf`}
                        type="checkbox"
                        checked={r.confidentiel}
                        onChange={e => handleResourceChange(idx, 'confidentiel', e.target.checked)}
                        class="form-check-input"
                      />
                      <label htmlFor={`res-${idx}-conf`} className="form-check-label ms-2">Confidentiel</label>
                    </div>
                  </div>
                  {modErr && <p className={styles.errorText}>{modErr}</p>}
                  <button type="button" className="btn btn-sm btn-danger mt-2" onClick={() => removeResource(idx)}>
                    Supprimer ressource
                  </button>
                </div>
                );
              })}
              <button type="button" className="btn btn-primary mb-4" onClick={addResource}>+ Ressource</button>
            </>
          )}

        {/* ----------------- Quiz --------------- */}
        <h4 className="mt-5 d-flex align-items-center">
          Quiz
          {!showQuiz && (
            <button type="button" className="btn btn-sm btn-primary ms-3"
                    onClick={() => { setShowQuiz(true); /* crée le quiz */ setFormData(p=>({...p, quiz: emptyQuiz()})); }}>
              + Ajouter
            </button>
          )}
        </h4>
        {showQuiz && (
        <>
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <label htmlFor="estimated_time" className={styles.formLabel}>Temps estimé (HH:MM:SS)<span className="text-danger">*</span></label>
              <input
                id="estimated_time"
                value={formData.quiz.estimated_time}
                onChange={e => handleQuizField('estimated_time', e.target.value)}
                className={`${styles.formControl} ${errors.domain ? styles.inputError : ''}`}
              />
            </div>
          </div>

          {formData.quiz.questions.map((q, qIdx) => {
            const modErr   = getError(`q${qIdx}`);
            const hasErr   = Boolean(modErr);
            return (
            <div key={qIdx} className="border p-3 mb-3 rounded">
              <div className="mb-2">
                <label htmlFor={`q-${qIdx+1}-question`} className={styles.formLabel}>Question<span className="text-danger">*</span></label>
                <input
                  id={`q-${qIdx+1}-question`}
                  type="text"
                  placeholder={`Question #${qIdx+1}`}
                  value={q.texte}
                  onChange={e => handleQuestionChange(qIdx,'texte',e.target.value)}
                  className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                />
              </div>
              <div className="row g-2 mt-2 mb-4">
                <div className="col-md-6">
                  <label htmlFor={`q-${qIdx}-type`} className={styles.formLabel}>Type</label>
                  <select
                    id={`q-${qIdx}-type`}
                    value={q.type}
                    onChange={e => setQuestionType(qIdx, e.target.value)}
                    className={styles.formControl}
                  >
                    <option value="single_choice">Un choix</option>
                    <option value="multiple_choice">Plusieurs choix</option>
                    <option value="text">Texte libre</option>
                    <option value="image_text">Voir image et insérer texte</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor={`q-${qIdx}-type`} className={styles.formLabel}>Point</label>
                  <input
                    type="number"
                    value={q.point}
                    onChange={e => handleQuestionChange(qIdx,'point',e.target.value)}
                    className={styles.formControl}
                    min={1}
                  />
                </div>
              </div>

              {/* === OPTIONS (uniquement pour single / multiple) === */}
              {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                <>
                  <label htmlFor={`q${qIdx}-opt-txt`} className="me-2">Texte option<span className="text-danger">*</span></label>
                  {q.options.map((o, oIdx) => (

                    <div key={oIdx} className="d-flex align-items-center mb-2">
                      <input
                        value={o.texte}
                        onChange={e => handleOptionChange(qIdx, oIdx, 'texte', e.target.value)}
                        className={`${styles.formControl} ${hasErr ? styles.inputError : ''} me-2`}
                        style={{ flex: 1 }}
                      />
                      <input
                        type={(q.type === 'single_choice') ? 'radio' : 'checkbox'}
                        checked={o.is_correct}
                        onChange={() => toggleOptionCorrect(qIdx, oIdx)}
                      />
                      <label className="ms-1">Correct</label>
                      <button type="button" className="btn btn-sm btn-danger ms-2"
                              onClick={() => removeOption(qIdx, oIdx)}>–</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-secondary"
                          onClick={() => addOption(qIdx)}>+ Option</button>
                </>
              )}

              {/* === IMAGE + MOTS-CLÉS (pour image_text) === */}
              {q.type === 'image_text' && (
                <>
                  <div className="mb-2">
                    <label htmlFor={`q-${qIdx}-img`} className={styles.formLabel}>Image<span className="text-danger">*</span></label>
                    <input
                      id={`q-${qIdx}-img`}
                      type="file"
                      accept="image/*"
                      onChange={e => handleQuestionChange(qIdx, 'image', e.target.files[0])}
                      className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor={`q-${qIdx}-kw`} className={styles.formLabel}>Mots-clés (séparés par virgule)</label>
                    <input
                      id={`q-${qIdx}-kw`}
                      type="text"
                      onChange={e =>
                        handleQuestionChange(
                          qIdx,
                          'correct_raw',
                          e.target.value
                        )
                      }
                      className={`${styles.formControl} ${hasErr ? styles.inputError : ''}`}
                    />
                  </div>
                </>
              )}

              <div>
                <button type="button" className="btn btn-sm btn-danger mt-2" onClick={() => removeQuestion(qIdx)}>
                  Supprimer question
                </button>
              </div>
            </div>
            );
          })}
          <button type="button" className="btn btn-primary mb-4" onClick={addQuestion}>+ Question</button>
        </>
        )}

        {/* ------------- Boutons ------------- */}
        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-secondary me-3" onClick={() => navigate('/manager/trainings')}>
            Annuler
          </button>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainingForm;
