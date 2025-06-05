import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * @param {{ show:boolean,
 *           onHide:()=>void,
 *           onConfirm:(id:number)=>void,
 *           domain:{ id:number,name:string, formation_count:number }|null }} props
 */
const DeleteDomainModal = ({ show, onHide, onConfirm, domain }) => {
  if (!domain) return null;

  const { id, name, formation_count } = domain;
  const hasLinks = formation_count > 0;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmer la suppression</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {hasLinks ? (
          <div className="text-danger">
            <p>
              <strong>{name}</strong> est lié à&nbsp;
              <strong>{formation_count}</strong> formation
              {formation_count > 1 && 's'}.
            </p>
            <p>
              Vous devez d’abord détacher ce domaine de toutes les formations
              (mettre le champ « Domaine » à vide) avant de pouvoir le supprimer.
            </p>
          </div>
        ) : (
          <p>
            Êtes-vous sûr de vouloir supprimer le domaine&nbsp;
            <strong>{name}</strong> ?
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>

        <Button
          variant="danger"
          onClick={() => onConfirm(id)}
          disabled={hasLinks}            /* 🔒 bloque la suppression si lié */
        >
          Supprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteDomainModal;
