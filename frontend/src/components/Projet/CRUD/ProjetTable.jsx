import React from 'react';
import styles from '../../../assets/styles/Table.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faTrash,
  faPen,         // use faPen instead of faPencilAlt
  faRocket,
} from '@fortawesome/free-solid-svg-icons';
const ProjetTable = ({ projets, onView, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.simpleTable}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Code</th>
            <th>Chef de projet</th>
            <th>Client direct</th>
            <th>Client final</th>
            <th>SOP</th>
            <th>Date de démarrage</th>
            <th>Nb. Collaborateurs</th>
            <th>Statut</th>
            <th>Actions</th>
        
          </tr>
        </thead>
        <tbody>
          {projets.length > 0 ? (
            projets.map(projet => (
              <tr key={projet.projet_id} className={styles.dataRow}>
                <td className={styles.nomCell}>{projet.nom}</td>
                <td>{projet.code}</td>
                <td>{projet.chef_de_projet}</td>
                <td>{projet.direct_client}</td>
                <td>{projet.final_client}</td>
                <td>
                  <span className={`${styles.sopBadge} ${styles[`sop${projet.sop.replace(/\s+/g, '')}`]}`}>
                    {projet.sop}
                  </span>
                </td>
                <td className={styles.dateCell}>{new Date(projet.date_demarrage).toLocaleDateString()}</td>
                <td>
                  {projet.collaborators_count !== undefined && projet.collaborators_count !== null
                    ? projet.collaborators_count
                    : '—'}
                </td> {/* Displaying the count */}
                <td>
                  <span className={`${styles.statusBadge} ${styles[`status${projet.statut.replace(/\s+/g, '')}`]}`}>
                    {projet.statut}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionGroup}>
                    <button
                      onClick={() => onView(projet)}
                      title="Voir"
                      className={`${styles.actionBtn} ${styles.view}`}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() => onEdit(projet.projet_id)}
                      title="Modifier"
                      className={`${styles.actionBtn} ${styles.edit}`}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      onClick={() => onDelete(projet.projet_id)}
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

export default ProjetTable;