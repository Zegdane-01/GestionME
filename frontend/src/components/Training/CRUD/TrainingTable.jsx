import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faPencilAlt, faRocket, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/styles/Table.module.css';

const TrainingTable = ({ trainings, onView, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.simpleTable}>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Domaine</th>
            <th>Créateur</th>
            <th># Modules</th>
            <th># Ressources</th>
            <th>Quiz</th>
            <th>Terminées</th>
            <th>Nombre d'Équipes</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trainings.length > 0 ? (
            trainings.map((training) => (
              <tr key={training.id} className={styles.dataRow}>
                <td className={styles.nomCell} >{training.titre}</td>
                <td>{training.domain_info?.name || ''}</td>
                <td>{training.created_by_info?.last_name || ''} {training.created_by_info?.first_name || ''}</td>
                <td>{training.module_count}</td>
                <td>{training.resource_count}</td>
                <td>
                  <FontAwesomeIcon
                    icon={training.has_quiz ? faCheckCircle : faTimesCircle}
                    style={{ color: training.has_quiz ? 'green' : 'gray' }}
                    title={training.has_quiz ? "Quiz disponible" : "Pas de quiz"}
                  />
                </td>
                <td>{training.passed_count}/{training.assigned_person_count} <small>({(training.passed_count/training.assigned_person_count)*100}%)</small></td>
                <td>{training.assigned_team_count}</td>
                <td>
                  <span
                    className={styles.badge}
                    style={{
                      backgroundColor: training.statut === 'actif' ? '#3cb371' : '#ff6347',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {training.statut}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionGroup}>
                    <button onClick={() => onEdit(training.id)} title="Modifier" className={`${styles['actionBtn']} ${styles.edit}`}>
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <button onClick={() => onDelete(training.id)} title="Supprimer" className={`${styles['actionBtn']} ${styles.delete}`}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className={styles.noData}>
                <div className={styles.noDataContent}>
                  <FontAwesomeIcon icon={faRocket} className={styles.noDataIcon} />
                  Aucune formation trouvée
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TrainingTable;
