import React from "react";
import { Play, FileText, Download, CheckCircle } from "lucide-react";
import styles from "../../../assets/styles/Training/TrainingDetail/OverviewTab.module.css";

/**
 * Onglet "Aperçu" / Introduction – affiche :
 *  - intro
 *  - liste des modules (chapitres)
 *  - liste des ressources
 *  - conclusion
 */
const OverviewTab = ({ training, onComplete, isCompleted }) => {
  /* Présence */
  const modules = training.modules ?? [];
  const ressources = training.ressources ?? [];
  const hasContent = modules.length > 0;
  const hasResources = ressources.length > 0;

  /* Helper ext */
  const getExt = (r) => {
    const raw = r.ext || r.name?.split(".").pop() || r.file?.split(".").pop() || "";
    return raw.toLowerCase();
  };

  /* Helper duration minutes → "xh ymin" */
  const fmtDuration = (d) => {
    if (!d) return "";
    // Backend en secondes ou 'PT1H30M'?  Ici on suppose minutes entier
    const min = Number(d);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h}h ${m}min` : `${m}min`;
  };

  return (
    <>
      {/* Intro */}
      {training.intro && (
        <div className={`card p-3 mb-4 ${styles.box}`}>
          <h4>Introduction</h4>
          <p>{training.introLong ?? training.intro}</p>
        </div>
      )}

      {/* Contenu & Ressources */}
      <div className="row gx-4 gy-3 align-items-stretch">
        {hasContent && (
          <div className={hasResources ? "col-lg-6" : "col-lg-12"}>
            <div className={`card h-100 p-4 ${styles.box}`}>
              <h5 className="mb-3 d-flex align-items-center gap-2">
                <Play size={16} /> Contenu
              </h5>
              {modules.map((m, idx) => (
                <div key={m.id} className={styles.line}>
                  <span className={styles.roundBadge}>{idx + 1}</span>
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{m.titre}</h6>
                    <small className="text-muted">{fmtDuration(m.duration)}</small>
                  </div>
                  {m.completed && <CheckCircle size={16} className="text-success" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasResources && (
          <div className={hasContent ? "col-lg-6" : "col-lg-12"}>
            <div className={`card h-100 p-4 ${styles.box}`}>
              <h5 className="mb-3 d-flex align-items-center gap-2">
                <FileText size={16} /> Ressources
              </h5>
              {ressources.map((r) => {
                const ext = getExt(r);
                const colorCls = styles[`extBadge_${ext}`] || "";
                const dlUrl = r.url || r.file || "#";
                return (
                  <div key={r.id} className={styles.line}>
                    <span className={`${styles.resBadge} ${colorCls}`}>{ext.slice(0, 2).toUpperCase()}</span>
                    <div className="flex-grow-1">
                      <strong className="d-block">{r.title ?? r.name}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Conclusion */}
      {training.conclusion && (
        <div className="mt-4">
          <h4>Conclusion</h4>
          <p>{training.conclusion}</p>
        </div>
      )}

      {/* Bouton validation */}
      <div className="d-flex justify-content-center mt-4 pt-4">
        {!isCompleted ? (
          <button className="btn btn-success" onClick={onComplete}>
            <CheckCircle size={18} className="me-2" /> Valider la lecture de cette section
          </button>
        ) : (
          <div className="alert alert-success d-flex align-items-center">
            <CheckCircle size={18} className="me-2" /> Section terminée ! Vous pouvez passer à la suite.
          </div>
        )}
      </div>
    </>
  );
};

export default OverviewTab;
