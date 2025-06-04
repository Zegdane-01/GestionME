import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import EquipeDetail from './EquipeDetail';
import styles from '../../../assets/styles/ViewModal.module.css';

const ViewEquipeModal = ({ show, onHide, equipe }) => {
  return (
    <Modal
      className={styles.customModal}
      show={show}
      onHide={onHide}
      centered
      size="lg"
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>
          Équipe
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <EquipeDetail equipe={equipe} />
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
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

export default ViewEquipeModal;
