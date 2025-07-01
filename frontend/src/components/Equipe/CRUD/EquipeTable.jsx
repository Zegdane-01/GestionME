import React, {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faTrash,
  faPencilAlt,
  faRocket,
  faUsers,
  faChevronLeft, 
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/styles/Table.module.css';

const EquipeTable = ({ equipes, onView, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Affichez 5 équipes par page

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // On ne montre que les équipes de la page actuelle
  const currentEquipes = equipes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(equipes.length / itemsPerPage);

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
            <th>Membres assignés</th>
            <th>Domaines</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentEquipes.length > 0 ? (
            currentEquipes.map((equipe) => (
              <tr key={equipe.id} className={styles.dataRow}>
                <td className={styles.nomCell}>{equipe.name}</td>
                <td>
                  <FontAwesomeIcon icon={faUsers} />{' '}
                  {equipe.assigned_users_count ?? 0} membre(s)
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
                      onClick={() => onDelete(equipe)}
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
              {/* MODIFIÉ : colSpan corrigé à 4 */}
              <td colSpan={4} className={styles.noData}>
                <div className={styles.noDataContent}>
                  <FontAwesomeIcon icon={faRocket} className={styles.noDataIcon} />
                  Aucune équipe trouvée
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

export default EquipeTable;
