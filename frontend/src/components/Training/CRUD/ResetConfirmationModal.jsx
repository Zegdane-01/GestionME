import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ResetConfirmationModal = ({ show, onHide, onConfirm, trainingTitle }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmer la réinitialisation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
         <p>
          Êtes-vous sûr de vouloir réinitialiser la formation : <strong>"{trainingTitle}"</strong> pour tous les collaborateurs inscrits ?
        </p>
        <div>
          Cette action est irréversible et archivera l'historique des trois derniers passages de quiz.
        </div>
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button variant='danger' onClick={onConfirm}>
          Confirmer la Réinitialisation
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResetConfirmationModal;