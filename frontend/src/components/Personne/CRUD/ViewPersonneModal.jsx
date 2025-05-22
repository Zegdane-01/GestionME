import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import PersonDetail from './PersonneDetail';
import styles from '../../../assets/styles/ViewModal.module.css';

const ViewPersonModal = ({ show, onHide, person }) => {
  return (
    <Modal
          className={styles.customModal}
          show={show}
          onHide={onHide}
          centered
          size="lg"
        >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>Collaborateur</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <PersonDetail person={person} />
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

export default ViewPersonModal;
