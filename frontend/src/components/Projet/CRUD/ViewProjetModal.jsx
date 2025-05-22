import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import ProjetDetail from './ProjetDetail';
import styles from '../../../assets/styles/ViewModal.module.css';

const ViewProjetModal = ({ show, onHide, projet }) => {
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
          Projet
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <ProjetDetail projet={projet} />
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

export default ViewProjetModal;