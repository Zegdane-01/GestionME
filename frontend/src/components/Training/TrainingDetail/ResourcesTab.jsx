// components/training/ResourcesTab.jsx
import React, { useState } from 'react';
import FileIcon from '../Shared/FileIcon';
import styles from '../../../assets/styles/Training/TrainingDetail/ResourcesTab.module.css';

const ResourcesTab = ({ training }) => {
  const [previewId, setPreviewId] = useState(null);

  return (
    <div className="row gy-4 mt-4">
      {training.resources.map(r => (
        <div className="col-lg-6" key={r.id}>
          <div className={`card p-3 ${styles.box} ${r.id === previewId && styles.selected}`}>
            <div className="d-flex align-items-start">
              <FileIcon ext={r.ext} />
              <div className="flex-grow-1 ms-3">
                <strong>{r.title ?? r.name}</strong>
                <p className="mb-1 small text-muted">{r.desc}</p>
                <small className="text-muted">{r.size}</small>
              </div>
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => setPreviewId(r.id)}
                >
                  👁 Visualiser
                </button>
                <a href={r.url} download className="btn btn-sm btn-dark">↓ Télécharger</a>
              </div>
            </div>

            {/* zone d’aperçu */}
            {previewId === r.id && (
              <div className={styles.preview}>
                {r.ext === 'pdf' && <iframe src={r.url} title="pdf" />}
                {r.ext === 'ppt' && <span>Présentation PowerPoint</span>}
                {r.ext === 'xlsx' && <span>Fichier Excel</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourcesTab;
