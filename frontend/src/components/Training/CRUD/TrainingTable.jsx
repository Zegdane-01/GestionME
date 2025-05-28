import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faPencilAlt, faRocket } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/styles/Table.module.css';

/**
 * Tableau des formations
 * — Affiche les colonnes principales + actions CRUD
 * — Utilise les mêmes styles que PersonTable pour la cohérence UI
 */
const TrainingTable = ({ trainings = [], onView, onEdit, onDelete }) => {
  // Petite fonction utilitaire pour formater la durée en "HH h MM".
  const formatDuration = minutes => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.simpleTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Département</th>
            <th>Durée</th>
            <th>Créateur</th>
            <th>Statut</th>
            <th>Progression</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trainings.length > 0 ? (
            trainings.map(training => (
              <tr key={training.id} className={styles.dataRow}>
                <td className={styles.codeCell}>{training.id}</td>
                <td>{training.title}</td>
                <td>{training.department}</td>
                <td>{formatDuration(training.duration)}</td>
                <td>{training.createdBy}</td>
                <td>{training.status}</td>

                {/* Colonne progression simple barre + pourcentage */}
                <td>
                  <div className={styles.progressWrapper}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                  <span className={styles.progressLabel}>{training.progress}%</span>
                </td>

                {/* ACTIONS */}
                <td className={styles.actionsCell}>
                  <div className={styles.actionGroup}>
                    <button
                      onClick={() => onView(training)}
                      title="Voir"
                      className={`${styles.actionBtn} ${styles.view}`}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>

                    <button
                      onClick={() => onEdit(training.id)}
                      title="Modifier"
                      className={`${styles.actionBtn} ${styles.edit}`}
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </button>

                    <button
                      onClick={() => onDelete(training.id)}
                      title="Supprimer"
                      className={`${styles.actionBtn} ${styles.delete}`}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className={styles.noData}>
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
