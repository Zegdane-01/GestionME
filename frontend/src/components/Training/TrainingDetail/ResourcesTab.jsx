// components/training/ResourcesTab.jsx
import React, { useState } from 'react';
import { CheckCircle, Download, Eye, EyeOff, AlertCircle } from 'lucide-react';
import FileIcon from '../Shared/FileIcon';
import styles from '../../../assets/styles/Training/TrainingDetail/ResourcesTab.module.css';

const ResourcesTab = ({ training, onRead, onComplete, isCompleted }) => {
  const [previewId, setPreviewId] = useState(null);

  /* URL absolue pour éviter le SPA router */
  const toAbsolute = (url) =>
    url.startsWith('http') ? url : window.location.origin + url;

  /* Choix du viewer */
  const buildViewerURL = (absUrl, ext) => {
    const office = ['ppt', 'pptx', 'xls', 'xlsx', 'doc', 'docx'];
    const images = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videos = ['mp4', 'webm', 'ogg'];
    const audio = ['mp3', 'wav', 'ogg'];
    
    ext = ext.toLowerCase();

    if (office.includes(ext) && absUrl.startsWith('https://')) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absUrl)}`;
    }
    
    if (images.includes(ext)) {
      return absUrl; // Afficher directement l'image
    }
    
    return null; // null ⇒ aperçu non dispo ou gestion spécifique
  };

  const renderPreview = (absUrl, ext) => {
    ext = ext.toLowerCase();
    
    // Fichiers PDF
    if (ext === 'pdf') {
      return <iframe src={absUrl} title="pdf" className={styles.fullPreview} />;
    }
    
    // Documents Office
    const officeViewer = buildViewerURL(absUrl, ext);
    if (officeViewer) {
      return <iframe src={officeViewer} title="office" className={styles.officePreview} />;
    }
    
    // Images
    const images = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (images.includes(ext)) {
      return (
        <div className={styles.imagePreview}>
          <img src={absUrl} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: '500px' }} />
        </div>
      );
    }
    
    // Vidéos
    const videos = ['mp4', 'webm', 'ogg'];
    if (videos.includes(ext)) {
      return (
        <video controls className={styles.videoPreview}>
          <source src={absUrl} type={`video/${ext}`} />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      );
    }
    
    // Audio
    const audio = ['mp3', 'wav', 'ogg'];
    if (audio.includes(ext)) {
      return (
        <audio controls className={styles.audioPreview}>
          <source src={absUrl} type={`audio/${ext}`} />
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      );
    }
    
    // Fichiers texte
    const textFiles = ['txt', 'csv', 'json', 'xml'];
    if (textFiles.includes(ext)) {
      return (
        <div className={styles.textPreview}>
          <iframe 
            src={absUrl} 
            title="text" 
            className={styles.fullPreview}
            onLoad={(e) => {
              // Pour éviter les problèmes CORS avec les iframes
              try {
                e.target.contentDocument.body.style.whiteSpace = 'pre-wrap';
                e.target.contentDocument.body.style.fontFamily = 'monospace';
                e.target.contentDocument.body.style.padding = '10px';
              } catch (err) {
                console.error('Impossible de styliser le contenu texte:', err);
              }
            }}
          />
        </div>
      );
    }
    
    // Par défaut : message d'absence de prévisualisation
    return (
      
      <div className="alert alert-warning">
        <AlertCircle size={28} className="text-warning mb-3" />
        <p>Aperçu indisponible ; téléchargez le fichier pour l'ouvrir.</p>
      </div>
    );
  };

  return (
    <>
      <div className="row gy-4 mt-4">
        {training.resources.map((r) => {
          const isPreview = r.id === previewId;
          const ext = (r.ext ?? r.name.split('.').pop()).toLowerCase();
          const absUrl = toAbsolute(r.url);

          return (
            <div className="col-lg-6" key={r.id}>
              <div
                className={`card p-3 ${styles.box} ${
                  isPreview && styles.selected
                }`}
              >
                {/* ─ meta ligne ─ */}
                <div className="d-flex align-items-start">
                  <FileIcon ext={ext} />
                  <div className="flex-grow-1 ms-3">
                    <strong>{r.title ?? r.name}</strong>
                    {r.desc && (
                      <p className="mb-1 small text-muted">{r.desc}</p>
                    )}
                    {r.size && <small className="text-muted">{r.size}</small>}
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => {
                        setPreviewId(isPreview ? null : r.id); // toggle
                        onRead?.(r.id);
                      }}
                    >
                       {isPreview ?(
                        <>
                          <EyeOff size={16} className="me-1" />
                          Fermer
                        </>
                        
                       ):(
                        <>
                          <Eye size={16} className="me-1" />
                          Visualiser
                        </>
                       )}
                    </button>
                    <a
                      href={absUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="btn btn-sm btn-dark"
                    >
                      <Download size={16} className="me-1" />
                      Télécharger
                    </a>
                  </div>
                </div>

                {/* ─ aperçu ─ */}
                {isPreview && (
                  <div className={styles.preview}>
                    {renderPreview(absUrl, ext)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─ validation bloc ─ */}
      <div className="d-flex justify-content-center mt-5">
        {!isCompleted ? (
          <button className="btn btn-success btn-lg" onClick={onComplete}>
            <CheckCircle size={20} className="me-2" />
            Valider la consultation des ressources
          </button>
        ) : (
          <div className="alert alert-success d-flex align-items-center">
            <CheckCircle size={20} className="me-2" />
            Ressources consultées ! Vous pouvez passer à la suite.
          </div>
        )}
      </div>
    </>
  );
};

export default ResourcesTab;