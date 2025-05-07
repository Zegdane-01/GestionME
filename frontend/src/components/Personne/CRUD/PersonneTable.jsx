import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import './PersonneTable.css';

const PersonTable = ({ people, onView, onEdit, onDelete }) => {
  return (
    <Table striped bordered hover responsive className="custom-table text-center">
      <thead>
        <tr>
          <th>Matricule</th>
          <th>Nom</th>
          <th>Prénom</th>
          <th>I/E</th>
          <th>Position</th>
          <th>Date d'embauche</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {people.length > 0 ? (
          people.map((person) => (
            <tr key={person.matricule} className="align-middle">
              <td>{person.matricule}</td>
              <td>{person.last_name}</td>
              <td>{person.first_name}</td>
              <td>{person.I_E}</td>
              <td>{person.position}</td>
              <td>{person.dt_Embauche}</td>
              <td>{person.status}</td>
              <td>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onView(person)}
                  title="Voir les détails"
                  className="action-btn me-2"
                >
                  <FontAwesomeIcon icon={faEye} />
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onEdit(person.matricule)}
                  title="Modifier"
                  className="action-btn me-2 "
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(person.matricule)}
                  title="Supprimer"
                  className="action-btn"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center">
              Aucune personne trouvée.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default PersonTable;