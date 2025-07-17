import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, onHide, onConfirm }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmer la réinitialisation</Modal.Title>
      </Modal.Header>
      <Modal.Body>Êtes-vous sûr de vouloir recommencer cette formation ? Toute votre progression sera perdue.</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button variant='danger' onClick={onConfirm}>
          Oui, recommencer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;