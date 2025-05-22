import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faPencilAlt, faRocket } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/styles/Table.module.css';
const PersonTable = ({ people, onView, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.simpleTable}>
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
              <tr key={person.matricule} className={styles.dataRow}>
                <td className={styles.codeCell}>{person.matricule}</td>
                <td>{person.last_name}</td>
                <td>{person.first_name}</td>
                <td>{person.role}</td>
                <td>{person.status}</td>
                <td>{person.position}</td>
                <td>{person.manager_info?.first_name || ''} {person.manager_info?.last_name || ''}</td>
                <td>{person.backup_info?.first_name || ''} {person.backup_info?.last_name || ''}</td>

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
                <td className={styles.actionsCell}>
                  <div className={styles.actionGroup}>
                    <button onClick={() => onView(person)} title="Voir" className={`${styles['actionBtn']} ${styles.view}`}>
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button onClick={() => onEdit(person.matricule)} title="Modifier" className={`${styles['actionBtn']} ${styles.edit}`}>
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <button onClick={() => onDelete(person.matricule)} title="Supprimer" className={`${styles['actionBtn']} ${styles.delete}`}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className={styles.noData}>
                <div className={styles.noDataContent}>
                  <FontAwesomeIcon icon={faRocket} className={styles.noDataIcon} />
                  Aucun projet trouvé
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PersonTable;
