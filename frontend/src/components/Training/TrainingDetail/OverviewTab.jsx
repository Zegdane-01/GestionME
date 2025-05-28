import React from 'react';
import { Play, FileText, Download, CheckCircle } from 'lucide-react';
import styles from '../../../assets/styles/Training/TrainingDetail/OverviewTab.module.css';

const OverviewTab = ({ training, onComplete, isCompleted }) => {
  /* Indicateurs de présence */
  const hasContent   = training.chapters.length  > 0;
  const hasResources = training.resources.length > 0;

  /* Utilitaire : récupérer l'extension en toute circonstance */
  const getExt = r =>
    (r.ext ??
     r.name?.split('.').pop() ??
     r.url?.split('.').pop() ??
     ''
    ).toLowerCase();

  return (
    <>
      {/* ─── Introduction ───────────────────────────────────────────── */}
      {training.intro && (
        <div className={`card h-100 p-3 ${styles.box}`}>
          <h4>Introduction</h4>
          <p>{training.introLong ?? training.intro}</p>
        </div>
      )}

      {/* ─── Contenu + Ressources (même hauteur) ─────────────────── */}
      <div className="row gx-4 gy-3 align-items-stretch">
        {/* Contenu -------------------------------------------------- */}
        {hasContent && (
          <div className={hasResources ? 'col-lg-6' : 'col-lg-12'}>
            <div className={`card h-100 p-4 ${styles.box}`}>
              <h5 className="mb-3">
                <Play size={14} /> Contenu
              </h5>

              {training.chapters.map((c, idx) => (
                <div key={c.id} className={styles.line}>
                  <span className={styles.roundBadge}>{idx + 1}</span>
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{c.title}</h6>
                    <small className="text-muted">{c.duration} min</small>
                  </div>
                  {c.completed && <CheckCircle size={16} className="text-success" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ressources ---------------------------------------------- */}
        {hasResources && (
          <div className={hasContent ? 'col-lg-6' : 'col-lg-12'}>
            <div className={`card h-100 p-4 ${styles.box}`}>
              <h5 className="mb-3">
                <FileText size={14} /> Ressources
              </h5>

              {training.resources.map(r => {
                const ext      = getExt(r);                          // pdf, xls…
                const colorCls = styles[`extBadge_${ext}`] || '';    // existe ?
                return (
                  <div key={r.id} className={styles.line}>
                    <span className={`${styles.resBadge} ${colorCls}`}>
                      {(ext || '??').slice(0, 2).toUpperCase()}
                    </span>

                    <div className="flex-grow-1">
                      <strong className="d-block">{r.title ?? r.name}</strong>
                      <small className="text-muted">{r.size ?? ''}</small>
                    </div>

                    {r.url && (
                      <a
                        href={r.url}
                        download
                        className={styles.dlBtn}
                        title="Télécharger"
                      >
                        <Download />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Conclusion ──────────────────────────────────────────── */}
      {training.conclusion && (
        <>
          <h4 className="mt-4">Conclusion</h4>
          <p>{training.conclusion}</p>
        </>
      )}

      {/* ─── Bouton de validation ──────────────────────────────────── */}
      <div className="d-flex justify-content-center mt-4 pt-4">
        {!isCompleted ? (
          <button 
            className="btn btn-success btn-lg"
            onClick={onComplete}
          >
            <CheckCircle size={20} className="me-2" />
            Valider la lecture de cette section
          </button>
        ) : (
          <div className="alert alert-success d-flex align-items-center">
            <CheckCircle size={20} className="me-2" />
            Section terminée ! Vous pouvez passer au contenu suivant.
          </div>
        )}
      </div>
    </>
  );
};

export default OverviewTab;