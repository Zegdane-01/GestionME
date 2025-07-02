import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { UploadCloud } from 'lucide-react';
import styles from './ExcelImportModal.module.css';

const ExcelImportModal = ({ show, onHide }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

    try {
      const res = await fetch('http://localhost:8000/api/import-excel/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert('Importation réussie : ' + data.message);
        onHide();
      } else {
        alert('Erreur : ' + data.error);
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className={styles.customModal}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>Import Excel</Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <p className={styles.description}>Importez vos données depuis un fichier Excel (.xlsx, .xls)</p>

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
            className="hidden"
            id="fileInput"
            style={{ display: 'none' }}
          />
          <label htmlFor="fileInput" className={styles.selectLabel}>
            Sélectionner un fichier
          </label>

          {file && <p className={styles.selectedFile}>Fichier sélectionné : {file.name}</p>}
        </div>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <Button
          onClick={handleUpload}
          disabled={!file}
          className={`${styles.uploadButton} ${file ? styles.uploadButtonEnabled : styles.uploadButtonDisabled}`}
        >
          Importer les données
        </Button>
        <Button
          variant="outline-secondary"
          onClick={onHide}
          className={styles.btnClose}
        >
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExcelImportModal;
