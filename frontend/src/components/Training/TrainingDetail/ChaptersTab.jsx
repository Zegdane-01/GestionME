import React, { useEffect, useState } from "react";
import { CheckCircle, Clock3 } from "lucide-react";
import { formatDuration } from '../../../utils/formatters'; 
import styles from "../../../assets/styles/Training/TrainingDetail/ChaptersTab.module.css";

/* ------------------------------------------------------------- */
/*   Onglet "Chapitres" – basé sur training.modules             */
/* ------------------------------------------------------------- */
const ChaptersTab = ({
  training = {},
  onChapterComplete = () => {},
  onTabComplete = () => {},
  isTabCompleted = false,
}) => {
  // Le backend renvoie la liste dans `modules`
  const modules = training.modules ?? [];

  // Chapitre courant (premier ou null)
  const [current, setCurrent] = useState(modules[0] ?? null);

  // Si la liste change (ex: après maj parent), on réinitialise le courant
  useEffect(() => {
    if (!current || !modules.find((m) => m.id === current.id)) {
      setCurrent(modules[0] ?? null);
    }
  }, [modules, current]);

  if (modules.length === 0) return <p>Aucun chapitre disponible.</p>;

  /* ----------------------------------------------------------- */
  /*  Handlers                                                   */
  /* ----------------------------------------------------------- */
  const currentDone = current?.completed ?? false;

  const handleValidateAndNext = () => {
    if (!current) return;
    onChapterComplete(current.id); // signale au parent

    const idx = modules.findIndex((m) => m.id === current.id);
    if (idx !== -1 && idx < modules.length - 1) {
      setCurrent(modules[idx + 1]);
    } else {
      onTabComplete(); // tous finis
    }
  };

  /* ----------------------------------------------------------- */
  /*  Render                                                     */
  /* ----------------------------------------------------------- */
  return (
    <div className="row gx-4 align-items-stretch">
      {/* Sidebar */}
      <aside className="col-lg-3 d-flex">
        <div className={`${styles.sidebarCard} flex-grow-1`}>
          <h5 className="mb-3">Chapitres</h5>
          <div className="list-group">
            {modules.map((m, idx) => (
              <button
                key={m.id}
                className={`list-group-item list-group-item-action d-flex align-items-center ${current?.id === m.id ? styles.active : ""}`}
                onClick={() => setCurrent(m)}
              >
                <div className="me-3">
                  <span className={styles.badge}>{idx + 1}</span>
                </div>
                <div className="flex-grow-1 text-start">
                  <strong className="d-block">{m.titre}</strong>
                  {formatDuration(m.estimated_time) && (
                    <small className="text-muted d-flex align-items-center mt-1">
                      <Clock3 size={12} className="me-1" />
                      {formatDuration(m.estimated_time)}
                    </small>
                  )}
                </div>
                {m.completed && <CheckCircle size={16} className="text-success" />}
              </button>
            ))}
          </div>

          {/* Progression */}
          <div className="mt-3 p-3 bg-light rounded">
            <small className="text-muted d-block mb-2">Progression</small>
            <div className="progress mb-2" style={{ height: 6 }}>
              <div
                className="progress-bar bg-success"
                style={{ width: `${(modules.filter((m) => m.completed).length / modules.length) * 100}%` }}
              />
            </div>
            <small className="text-muted">
              {modules.filter((m) => m.completed).length} / {modules.length} chapitre{modules.length > 1 ? "s" : ""}
            </small>
          </div>
        </div>
      </aside>

      {/* Player */}
      <section className="col-lg-9 d-flex">
        <div className={`${styles.playerCard} flex-grow-1`}>
          {current ? (
            <>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4>{current.titre}</h4>
                  <p className="text-muted mb-0">{current.description}</p>
                </div>
                {currentDone && (
                  <span className="badge bg-success">
                    <CheckCircle size={14} className="me-1" /> Terminé
                  </span>
                )}
              </div>

              <video
                key={current.id}
                src={encodeURI(current.video)}
                controls
                className="mb-4 w-100"
                style={{ borderRadius: 6, background: "#0f172a" }}
              />

              <div className="d-flex justify-content-center gap-3">
                {!currentDone ? (
                  <button className="btn btn-success" onClick={handleValidateAndNext}>
                    <CheckCircle size={20} className="me-2" /> Valider ce chapitre
                  </button>
                ) : (
                  <div className="alert alert-success d-flex align-items-center mb-0">
                    <CheckCircle size={20} className="me-2" /> Chapitre terminé !
                  </div>
                )}
              </div>
            </>
          ) : (
            <p>Aucun chapitre sélectionné.</p>
          )}
        </div>
      </section>

      {/* Tab complétée */}
      {isTabCompleted && (
        <div className="d-flex justify-content-center mt-4">
          <div className="alert alert-success d-flex align-items-center">
            <CheckCircle size={20} className="me-2" /> Section Chapitres terminée ! Passez à la suite.
          </div>
        </div>
      )}
    </div>
  );
};

export default ChaptersTab;
