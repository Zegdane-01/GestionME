import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import './PersonneTable.css';

const PersonTable = ({ people, onView, onEdit, onDelete }) => {
  return (
    <div className="table-container">
      <table className="simple-table">
        <thead>
          <tr>
            <th>Matricule</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Role</th>
            <th>Status</th>
            <th>Position</th>
            <th>Manager</th>
            <th>Back up</th>
            <th>Actif</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {people.length > 0 ? (
            people.map((person) => (
              <tr key={person.matricule}>
                <td>{person.matricule}</td>
                <td>{person.last_name}</td>
                <td>{person.first_name}</td>
                <td>{person.role}</td>
                <td>{person.status}</td>
                <td>{person.position}</td>
                <td>{person.manager?.first_name || ''} {person.manager?.last_name || ''}</td>
                <td>{person.backup?.first_name || ''} {person.backup?.first_name || ''}</td>

                <td><span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: person.is_active ? 'green' : 'red',
                  }}
                  title={person.is_active ? 'Actif' : 'Inactif'}
                /></td>
                <td>
                  <button onClick={() => onView(person)} title="Voir" className="action-btn view">
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button onClick={() => onEdit(person.matricule)} title="Modifier" className="action-btn edit">
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                  <button onClick={() => onDelete(person.matricule)} title="Supprimer" className="action-btn delete">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="no-data">Aucune personne trouvée.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PersonTable;
