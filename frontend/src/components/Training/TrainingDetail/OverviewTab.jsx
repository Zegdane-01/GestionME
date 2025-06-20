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
    const raw = r.file?.split(".").pop() || "";
    return raw.toLowerCase();
  };

  const toAbsolute = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${window.location.origin}${url}`;
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

  const handleDownload = async (resource) => {
    try {
      const absUrl = toAbsolute(resource.file);
      
      const response = await fetch(absUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.title || resource.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur de téléchargement: ${error.message}`);
    }
  };
  return (
    <>
      {/* Intro */}
      {training.description && (
        <div className={`card p-3 mb-4 ${styles.box}`}>
          <h4>Introduction</h4>
          <p>{training.description}</p>
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
                <FileText size={16} /> Supports
              </h5>
              {ressources.map((r) => {
                const ext = getExt(r);
                const colorCls = styles[`extBadge_${ext}`] || "";
                const dlUrl = r.file || "#";
                return (
                  <div key={r.id} className={styles.line}>
                    <span className={`${styles.resBadge} ${colorCls}`}>{ext.slice(0, 2).toUpperCase()}</span>
                    <div className="flex-grow-1">
                      <strong className="d-block">{r.name}.{ext}</strong>
                    </div>
                    <button
                                          className="btn btn-sm btn-dark"
                                          onClick={() => handleDownload(r)}
                                        >
                                          <div className="d-flex align-items-center">
                                            <Download size={16} className="me-1" /> &nbsp;Télécharger
                                          </div>
                                        </button>
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
