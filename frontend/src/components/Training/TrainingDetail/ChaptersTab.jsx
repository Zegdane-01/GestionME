import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import styles from '../../../assets/styles/Training/TrainingDetail/ChaptersTab.module.css';

const ChaptersTab = ({ training, onChapterComplete, onTabComplete, isTabCompleted }) => {
  const [current, setCurrent] = useState(training.chapters[0]);

  const currentChapterCompleted = current?.completed || false;

  const handleValidateAndNext = () => {
    /* 1. on marque le chapitre courant comme terminé côté parent */
    onChapterComplete(current.id);

    /* 2. on cherche l’index du chapitre courant dans la liste */
    const idx = training.chapters.findIndex(ch => ch.id === current.id);

    /* 3. s’il existe un chapitre suivant, on l’affiche tout de suite */
    if (idx < training.chapters.length - 1) {
      setCurrent(training.chapters[idx + 1]);
    }
    /* 4. sinon on laisse le parent basculer d’onglet quand il constatera
          que tous les chapitres sont complétés (logique déjà dans
          handleChapterCompletion) */
  };


  return (
    <div className="row gx-4 align-items-stretch">
      {/* Sidebar chapitres */}
      <aside className="col-lg-3 d-flex">
        <div className={`${styles.sidebarCard} flex-grow-1`}>
          <h5 className="mb-3">Chapitres</h5>
          <div className="list-group">
            {training.chapters.map((c, idx) => (
              <button
                key={c.id}
                className={`list-group-item list-group-item-action d-flex align-items-center ${current.id === c.id && styles.active}`}
                onClick={() => setCurrent(c)}
              >
                <div className="me-3">
                  <span className={styles.badge}>{idx + 1}</span>
                </div>
                <div className="flex-grow-1">
                  <strong className="d-block">{c.title}</strong>
                  <small className="text-muted">{c.duration}min</small>
                </div>
                {c.completed && (
                  <CheckCircle size={16} className="text-success" />
                )}
              </button>
            ))}
          </div>

          {/* Indicateur de progression globale */}
          <div className="mt-3 p-3 bg-light rounded">
            <small className="text-muted d-block mb-2">Progression</small>
            <div className="progress mb-2" style={{ height: 6 }}>
              <div 
                className="progress-bar bg-success" 
                style={{ 
                  width: `${(training.chapters.filter(c => c.completed).length / training.chapters.length) * 100}%` 
                }}
              />
            </div>
            <small className="text-muted">
              {training.chapters.filter(c => c.completed).length} / {training.chapters.length} chapitres
            </small>
          </div>
        </div>
      </aside>

      {/* Player */}
      <section className="col-lg-9 d-flex">
        <div className={`${styles.playerCard} flex-grow-1`}>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4>{current.title}</h4>
              <p className="text-muted mb-0">{current.description}</p>
            </div>
            {currentChapterCompleted && (
              <span className="badge bg-success">
                <CheckCircle size={14} className="me-1" />
                Terminé
              </span>
            )}
          </div>

          <video
            key={current.id}           /* force reload */
            src={current.videoUrl}
            controls
            style={{ width: '100%', borderRadius: 6, background: '#0f172a' }}
            className="mb-4"
          />

          {/* Boutons de validation */}
          <div className="d-flex justify-content-center gap-3">
            {!currentChapterCompleted ? (
              <button
                className="btn btn-success"
                onClick={handleValidateAndNext}
              >
                <CheckCircle size={20} className="me-2" />
                Valider ce chapitre
              </button>
            ) : (
              <div className="alert alert-success d-flex align-items-center mb-0">
                <CheckCircle size={20} className="me-2" />
                Chapitre terminé !
              </div>
            )}
          </div>
        </div>
      </section>
        <div className="d-flex justify-content-center mt-4">

          {isTabCompleted && (
            <div className="text-center mt-4">
              <div className="alert alert-success d-flex align-items-center justify-content-center">
                <CheckCircle size={20} className="me-2" />
                Section Chapitres terminée ! Passez à la suite.
              </div>
            </div>
          )}
        </div>
      
    </div>
  );
};

export default ChaptersTab;