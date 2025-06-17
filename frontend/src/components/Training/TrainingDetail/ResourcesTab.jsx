import React, { useState } from "react";
import { Lock, CheckCircle, Download, Eye, EyeOff, AlertCircle } from "lucide-react";
import FileIcon from "../Shared/FileIcon";
import styles from "../../../assets/styles/Training/TrainingDetail/ResourcesTab.module.css";
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
  const [previewId, setPreviewId] = useState(null);

  /* --------------------------------------------------------- */
  /* Helpers                                                   */
  /* --------------------------------------------------------- */
  const toAbsolute = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${window.location.origin}${url}`;
  };

  const buildViewerURL = (absUrl, ext) => {
    const office = ["ppt", "pptx", "xls", "xlsx", "doc", "docx"];
    const images = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    ext = ext.toLowerCase();

    if (office.includes(ext) && absUrl.startsWith("https://")) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absUrl)}`;
    }
    if (images.includes(ext)) return absUrl;
    return null; // autre type → gestion ailleurs
  };

  const renderPreview = (absUrl, ext) => {
    if (!absUrl) return null;
    ext = ext.toLowerCase();

    if (ext === "pdf") return <iframe src={absUrl} title="pdf" className={styles.fullPreview} />;

    const officeViewer = buildViewerURL(absUrl, ext);
    if (officeViewer)
      return <iframe src={officeViewer} title="office" className={styles.officePreview} />;

    const images = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    if (images.includes(ext))
      return (
        <div className={styles.imagePreview}>
          <img src={absUrl} alt="Aperçu" style={{ maxWidth: "100%", maxHeight: 500 }} />
        </div>
      );

    const videos = ["mp4", "webm", "ogg"];
    if (videos.includes(ext))
      return (
        <video controls className={styles.videoPreview}>
          <source src={absUrl} type={`video/${ext}`} />
        </video>
      );

    const audio = ["mp3", "wav", "ogg"];
    if (audio.includes(ext))
      return (
        <audio controls className={styles.audioPreview}>
          <source src={absUrl} type={`audio/${ext}`} />
        </audio>
      );

    const textFiles = ["txt", "csv", "json", "xml"];
    if (textFiles.includes(ext))
      return (
        <iframe src={absUrl} title="text" className={styles.fullPreview} />
      );

    return (
      <div className="alert alert-warning d-flex flex-column align-items-center">
        <AlertCircle size={28} className="text-warning mb-2" />
        <p className="mb-0 text-center">Aperçu indisponible&nbsp;; téléchargez le fichier.</p>
      </div>
    );
  };

  /* --------------------------------------------------------- */
  /* Render                                                    */
  /* --------------------------------------------------------- */
  if (!training.ressources?.length) return <p>Aucune ressource.</p>;

  return (
    <>
      <div className="row gy-4 mt-4">
        {training.ressources.map((r) => {
          const isPreview = previewId === r.id;
          const ext       = r.ext || getExtensionFromUrl(r.file || r.url);
          if (!r.accessible) {
            /* ---------- Ressource verrouillée ---------- */
            return (
              <div className="col-lg-6" key={r.id}>
                <div className={`card p-3 ${styles.box} ${styles.locked}`}>
                  <div className="d-flex align-items-start">
                    <FileIcon ext={ext} />
                    <div className="flex-grow-1 ms-3">
                      <strong>{r.name}</strong>
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
          const absUrl = toAbsolute(r.file || r.url);
          return (
            <div className="col-lg-6" key={r.id}>
              <div className={`card p-3 ${styles.box} ${isPreview ? styles.selected : ""}`}>                
                {/* Ligne méta */}
                <div className="d-flex align-items-start">
                  <FileIcon ext={ext} />
                  <div className="flex-grow-1 ms-3">
                    <strong>{r.title ?? r.name}</strong>
                    {r.size && <small className="d-block text-muted">{r.size}</small>}
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => {
                        // toggle preview
                        setPreviewId(isPreview ? null : r.id);
                        if (!r.read) onRead?.(r.id);
                      }}
                    >
                      {isPreview ? (
                        <>
                          <EyeOff size={16} className="me-1" /> Fermer
                        </>
                      ) : (
                        <>
                          <Eye size={16} className="me-1" /> Visualiser
                        </>
                      )}
                    </button>
                    <a
                      href={absUrl}
                      className="btn btn-sm btn-dark"
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Download size={16} className="me-1" /> Télécharger
                    </a>
                  </div>
                </div>

                {/* Aperçu */}
                {isPreview && <div className={styles.preview}>{renderPreview(absUrl, ext)}</div>}
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
    </>
  );
};

export default ResourcesTab;
