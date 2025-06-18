import React, { useState } from "react";
import { Clock3, Lock, CheckCircle, Download, Eye, AlertCircle } from "lucide-react";
import FileIcon from "../Shared/FileIcon";
import { formatDuration } from "../../../utils/formatters";
import styles from "../../../assets/styles/Training/TrainingDetail/ResourcesTab.module.css";
import ResourcePreviewModal from './ResourcePreviewModal';

const getExtensionFromUrl = (url) => {
  try {
    const decoded = decodeURIComponent(url);                   // pour décoder les %C3%A9 etc.
    const filename = decoded.split("/").pop();                 // récupérer "nom.pdf"
    const ext = filename.includes(".") ? filename.split(".").pop() : "";
    return ext.toLowerCase();
  } catch (err) {
    return "";
  }
};

/**
 * Onglet Ressources
 * Props
 *  - training        : formation détaillée (contient ressources[])
 *  - onRead(resourceId)
 *  - onComplete()     : clic "Valider les ressources"
 *  - isCompleted      : bool (toutes lues)
 */
const ResourcesTab = ({ training, onRead, onComplete, isCompleted }) => {
  const [previewRes, setPreviewRes] = useState(null);

  /* --------------------------------------------------------- */
  /* Helpers                                                   */
  /* --------------------------------------------------------- */
  const toAbsolute = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${window.location.origin}${url}`;
  };
  /* --------------------------------------------------------- */
  /* Render                                                    */
  /* --------------------------------------------------------- */
  if (!training.ressources?.length) return <p>Aucune ressource.</p>;
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
      <div className="row gy-4 mt-4">
        {training.ressources.map((r) => {
          const ext       = r.ext || getExtensionFromUrl(r.file || r.url);
          const duration = formatDuration(r.estimated_time);
          if (!r.accessible) {
            /* ---------- Ressource verrouillée ---------- */
            return (
              <div className="col-lg-6" key={r.id}>
                <div className={`card p-3 ${styles.box} ${styles.locked}`}>
                  <div className="d-flex align-items-start">
                    <FileIcon ext={ext} />
                    <div className="flex-grow-1 ms-3">
                      <strong>{r.name}</strong>
                      {duration && (
                        <p className="small text-muted mb-0 mt-1 d-flex align-items-center">
                            <Clock3 size={14} className="me-1" />
                            {duration}
                        </p>
                      )}
                    </div>
                    <Lock size={20} />
                  </div>

                  <div className="alert alert-danger mt-3 d-flex align-items-center">
                    <AlertCircle size={18} className="me-2" />
                    Vous n’avez pas les droits d’accéder à cette ressource.
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div className="col-lg-6" key={r.id}>
              <div className={`card p-3 ${styles.box}`}>                
                {/* Ligne méta */}
                <div className="d-flex align-items-start">
                  <FileIcon ext={ext} />
                  <div className="flex-grow-1 ms-3">
                    <strong>{r.name}</strong>
                    {duration && (
                      <p className="small text-muted mb-0 mt-1 d-flex align-items-center">
                        <Clock3 size={14} className="me-1" />
                        Temps de lecture estimé : {duration}
                      </p>
                    )}
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => {
                        setPreviewRes(r);  
                        if (!r.read) onRead?.(r.id);
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <Eye size={16} className="me-1" /> &nbsp;Visualiser
                      </div>
                    </button>
                    <button
                      className="btn btn-sm btn-dark"
                      onClick={() => handleDownload(r)}
                    >
                      <div className="d-flex align-items-center">
                        <Download size={16} className="me-1" /> &nbsp;Télécharger
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation */}
      <div className="d-flex justify-content-center mt-5">
        {!isCompleted ? (
          <button className="btn btn-success" onClick={onComplete}>
            <CheckCircle size={18} className="me-2" /> Valider la consultation des ressources
          </button>
        ) : (
          <div className="alert alert-success d-flex align-items-center">
            <CheckCircle size={18} className="me-2" /> Toutes les ressources ont été lues.
          </div>
        )}
      </div>
      <ResourcePreviewModal res={previewRes} onHide={() => setPreviewRes(null)} />
    </>
  );
};

export default ResourcesTab;
