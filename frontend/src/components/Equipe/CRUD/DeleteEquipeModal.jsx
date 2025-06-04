import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Modal de confirmation de suppression d'une équipe
 */
const DeleteEquipeModal = ({ show, onHide, onConfirm }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Confirmer la Suppression</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      Êtes‑vous sûr de vouloir supprimer cette équipe&nbsp;?
    </Modal.Body>

    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Annuler
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Supprimer
      </Button>
    </Modal.Footer>
  </Modal>
);

export default DeleteEquipeModal;
