import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * @param {{
 *   show: boolean,
 *   onHide: () => void,
 *   onConfirm: (id:number) => void,
 *   equipe: { id:number, name:string, assigned_users_count:number } | null
 * }} props
 */
const DeleteEquipeModal = ({ show, onHide, onConfirm, equipe }) => {
  if (!equipe) return null;

  const { id, name, assigned_users_count } = equipe;
  const blocked = assigned_users_count > 0;   // ✅ on teste uniquement ça

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmer la suppression</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {blocked ? (
          <div className="text-danger">
            <p>
              <strong>{name}</strong> possède encore&nbsp;
              <strong>{assigned_users_count}</strong>&nbsp;
              collaborateur{assigned_users_count > 1 && 's'} assigné
              {assigned_users_count > 1 && 's'}.
            </p>
            <p>
              Veuillez retirer ces collaborateurs de l’équipe avant de la
              supprimer.
            </p>
          </div>
        ) : (
          <p>
            Êtes-vous sûr de vouloir supprimer l’équipe&nbsp;
            <strong>{name}</strong>&nbsp;?
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
          disabled={blocked}
        >
          Supprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteEquipeModal;
