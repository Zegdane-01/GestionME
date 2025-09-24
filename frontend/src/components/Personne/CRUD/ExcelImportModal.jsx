import React, { useState } from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import { UploadCloud } from 'lucide-react';
import styles from './ExcelImportModal.module.css';
import { toast } from 'react-hot-toast';

const ExcelImportModal = ({ show, onHide }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [sheetName, setSheetName] = useState('Plan de charge ME 2025');

  const [importSummary, setImportSummary] = useState(null); 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheet_name', sheetName);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://10.133.28.114/api/personne/import-excel/', true);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`); // si JWT
    setIsUploading(true);
    setImportSummary(null); 

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded * 100) / e.total);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      setUploadProgress(0);
      if (xhr.status === 200) {
        
        toast.success('Importation réussie');
        const response = JSON.parse(xhr.responseText);
        setImportSummary(response.résumé);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          toast.error('❌ ' + (err.error || err.message || 'Erreur inconnue'));
        } catch {
          toast.error('❌ Erreur serveur');
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Erreur réseau');
    };

    xhr.send(formData);
    
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className={styles.customModal}>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>Import Excel</Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <p className={styles.description}>Importez vos données depuis un fichier Excel (.xlsx, .xls)</p>
        {!importSummary ? (
          <>
            <div className="mt-3">
              <label className={styles.sheetLabel}>Nom de la feuille Excel</label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className={styles.sheetInput}
                placeholder="Ex: Plan de charge ME 2025"
              />
            </div>

            <div className="mt-3">
              <label className={styles.sheetLabel}>Sélectionner un fichier</label>
              <div
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneDragging : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <UploadCloud className={styles.uploadIcon} />
                <p><strong>Glissez-déposez votre fichier Excel ici</strong></p>
                <p className={styles.description}>ou cliquez pour sélectionner un fichier</p>

                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  id="fileInput"
                  style={{ display: 'none' }}
                />
                <label htmlFor="fileInput" className={styles.selectLabel}>
                  Sélectionner un fichier
                </label>

                {file && <p className={styles.selectedFile}>Fichier sélectionné : {file.name}</p>}
              </div>
            </div>
            {isUploading && (
              <div className="mt-3">
                <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} animated />
              </div>
            )}
          </>
        ):(
          <div className={styles.summaryCard}>
            <h4 className={styles.summaryTitle}>Résumé de l'importation</h4>
            
            <div className={styles.summaryGrid}>
              {/* Colonne pour les collaborateurs */}
              <div className={styles.summarySection}>
                <strong>Collaborateurs</strong>
                <ul>
                  <li>
                    <span>Créés :</span>
                    <span className={styles.summaryValue}>{importSummary.personnes.créés}</span>
                  </li>
                  <li>
                    <span>Modifiés :</span>
                    <span className={styles.summaryValue}>{importSummary.personnes.modifiés}</span>
                  </li>
                  <li>
                    <span>Ignorés :</span>
                    <span className={styles.summaryValue}>{importSummary.personnes.ignorés}</span>
                  </li>
                </ul>
              </div>

              {/* Colonne pour les projets */}
              <div className={styles.summarySection}>
                <strong>Projets</strong>
                <ul>
                  <li>
                    <span>Créés :</span>
                    <span className={styles.summaryValue}>{importSummary.projets.créés}</span>
                  </li>
                  <li>
                    <span>Modifiés :</span>
                    <span className={styles.summaryValue}>{importSummary.projets.modifiés}</span>
                  </li>
                  <li>
                    <span>Ignorés :</span>
                    <span className={styles.summaryValue}>{importSummary.projets.ignorés}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        {!importSummary ? (
          <>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`${styles.uploadButton} ${file ? styles.uploadButtonEnabled : styles.uploadButtonDisabled}`}
            >
              {isUploading ? 'Importation...' : 'Importer les données'}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={onHide}
              className={styles.btnClose}
              disabled={isUploading}
            >
              Fermer
            </Button>
          </>
        ):(
          <button
            className={styles.finButton}
            onClick={onHide}
          >
            Terminer
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ExcelImportModal;
