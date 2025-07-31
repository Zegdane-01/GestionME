import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { KeyRound, X } from 'lucide-react';

const ResetPasswordModal = ({ show, onHide, onConfirm, userName }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <KeyRound className="me-2 text-warning" />
          Confirmer la réinitialisation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Êtes-vous sûr de vouloir réinitialiser le mot de passe de <strong>{userName}</strong> ?</p>
        <div className="alert alert-warning">
          Le nouveau mot de passe de l'utilisateur deviendra son <strong>matricule</strong>.
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <X size={16} className="me-1" /> Annuler
        </Button>
        <Button variant="warning" onClick={onConfirm}>
          <KeyRound size={16} className="me-1" /> Confirmer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResetPasswordModal;