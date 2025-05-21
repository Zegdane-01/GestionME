import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faTrash,
  faPen,         // use faPen instead of faPencilAlt
  faTag,
  faFileSignature,
  faBuilding,
  faAddressBook,
  faClipboardCheck,
  faRocket,
  faCircle,    // use faChartBar instead of faChartNetwork
  faCalendar     // use faCalendar instead of faCalendarStart
} from '@fortawesome/free-solid-svg-icons';
import styles from './ProjetTable.module.css';

const ProjetTable = ({ projets, onView, onEdit, onDelete }) => {
  return (
    <div className={styles.futuristicLightContainer}>
      <table className={styles.futuristicLightTable}>
        <thead>
          <tr>
            <th><FontAwesomeIcon icon={faTag} className={styles.headerIcon} /> Code</th>
            <th><FontAwesomeIcon icon={faFileSignature} className={styles.headerIcon} /> Nom</th>
            <th><FontAwesomeIcon icon={faBuilding} className={styles.headerIcon} /> Client direct</th>
            <th><FontAwesomeIcon icon={faAddressBook} className={styles.headerIcon} /> Client final</th>
            <th><FontAwesomeIcon icon={faClipboardCheck} className={styles.headerIcon} /> SOP</th>
            <th><FontAwesomeIcon icon={faCalendar} className={styles.headerIcon} /> Date démarrage</th>
            <th><FontAwesomeIcon icon={faCircle} className={styles.headerIcon} /> Statut</th>
            <th><FontAwesomeIcon icon={faRocket} className={styles.headerIcon} /> Actions</th>
          </tr>
        </thead>
        <tbody>
          {projets.length > 0 ? (
            projets.map(projet => (
              <tr key={projet.projet_id} className={styles.dataRow}>
                <td className={styles.codeCell}>{projet.code}</td>
                <td>{projet.nom}</td>
                <td>{projet.direct_client}</td>
                <td>{projet.final_client}</td>
                <td>{projet.sop}</td>
                <td className={styles.dateCell}>{new Date(projet.date_demarrage).toLocaleDateString()}</td>
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