import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import PersonDetail from './PersonneDetail';
import './ViewPersonneModal.css';

const ViewPersonModal = ({ show, onHide, person }) => {
  return (
    <Modal className='modal-lg custem-modal' show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Détails de la Personne</Modal.Title>
      </Modal.Header>
      <Modal.Body className='modal-body'>
        <PersonDetail person={person} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewPersonModal;
