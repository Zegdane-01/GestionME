import React from 'react';
import styles from './ConfirmationModal.module.css'; // Nous créerons ce fichier CSS

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h5 className={styles.title}>{title}</h5>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
        <div className={styles.footer}>
          <button onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button onClick={onConfirm} className="btn btn-primary">Confirmer</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;