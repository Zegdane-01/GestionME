import React, {useState} from 'react';
import styles from '../../../assets/styles/Table.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faTrash,
  faPen,
  faRocket,
  faChevronLeft, 
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
const ProjetTable = ({ projets, onView, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Affichez 10 projets par page

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // On ne montre que les projets de la page actuelle
  const currentProjets = projets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(projets.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  return (
    <div className={styles.tableContainer}>
      <table className={styles.simpleTable}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Ordre de travail</th>
            <th>Chef de projet</th>
            <th>Client final</th>
            <th>SOP</th>
            <th>Date de démarrage</th>
            <th>Nb. Collaborateurs</th>
            <th>Statut</th>
            <th>Actions</th>
        
          </tr>
        </thead>
        <tbody>
          {currentProjets.length > 0 ? (
            currentProjets.map(projet => (
              <tr key={projet.projet_id} className={styles.dataRow}>
                <td className={styles.nomCell}>{projet.nom}</td>
                <td>{projet.ordre_travail}</td>
                <td>{projet.chef_de_projet}</td>
                <td>{projet.final_client}</td>
                <td>
                  <span className={`${styles.sopBadge} ${styles[`sop${projet.sop.replace(/\s+/g, '')}`]}`}>
                    {projet.sop}
                  </span>
                </td>
                <td className={styles.dateCell}>{new Date(projet.date_demarrage).toLocaleDateString('fr-FR')}</td>
                <td className='text-center'>
                  {projet.collaborators_count ?? '—'}
                </td>
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
              {/* MODIFIÉ : colSpan corrigé à 10 */}
              <td colSpan={10} className={styles.noData}>
                <div className={styles.noDataContent}>
                  <FontAwesomeIcon icon={faRocket} className={styles.noDataIcon} />
                  Aucun projet trouvé
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
            title="Page précédente"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`${styles.paginationButton} ${currentPage === number ? styles.active : ''}`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
            title="Page suivante"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjetTable;