import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faTrash,
  faPencilAlt,
  faRocket,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/styles/Table.module.css';

const EquipeTable = ({ equipes, onView, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.simpleTable}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Membres assignés</th>
            <th>Domaines</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipes.length > 0 ? (
            equipes.map((equipe) => (
              <tr key={equipe.id} className={styles.dataRow}>
                <td className={styles.nomCell}>{equipe.name}</td>
                <td>
                  <FontAwesomeIcon icon={faUsers} />{' '}
                  {equipe.assigned_users?.length ?? 0} membre(s)
                </td>
                <td>
                    <FontAwesomeIcon icon={faRocket} />{' '}
                    {equipe.domain_count ?? 0} domaine(s)
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionGroup}>
                    <button
                      onClick={() => onView(equipe)}
                      title="Voir"
                      className={`${styles['actionBtn']} ${styles.view}`}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() => onEdit(equipe.id)}
                      title="Modifier"
                      className={`${styles['actionBtn']} ${styles.edit}`}
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <button
                      onClick={() => onDelete(equipe.id)}
                      title="Supprimer"
                      className={`${styles['actionBtn']} ${styles.delete}`}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className={styles.noData}>
                <div className={styles.noDataContent}>
                  <FontAwesomeIcon icon={faRocket} className={styles.noDataIcon} />
                  Aucune équipe trouvée
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EquipeTable;
