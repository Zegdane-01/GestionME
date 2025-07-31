import React, {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faPencilAlt, faRocket,faChevronLeft, faChevronRight, faKey } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/styles/Table.module.css';
const PersonTable = ({ people, onView, onEdit, onDelete, onResetPassword }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPeoples = people.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(people.length / itemsPerPage);

  // Fonction pour gérer le changement de page
  const handlePageChange = (pageNumber) => {
      // S'assurer que le numéro de page est dans les limites valides
      if (pageNumber >= 1 && pageNumber <= totalPages) {
          setCurrentPage(pageNumber);
      }
  };
   
  return (
    <div className={styles.tableContainer}>
      <table className={styles.simpleTable}>
        <thead>
          <tr>
            <th>Matricule</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Role</th>
            <th>Statut</th>
            <th>Position</th>
            <th>Profile</th>
            <th>Manager</th>
            <th>Back up</th>
            <th>Actif</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {currentPeoples.length > 0 ? (
                currentPeoples.map((person) => (
                    <tr key={person.matricule} className={styles.dataRow}>
                        <td className={styles.codeCell}>{person.matricule}</td>
                        <td>{person.last_name}</td>
                        <td>{person.first_name}</td>
                        <td>{person.role}</td>
                        <td>{person.status}</td>
                        <td>{person.position}</td>
                        <td>{person.profile}</td>
                        <td>{`${person.manager_info?.first_name || ''} ${person.manager_info?.last_name || ''}`}</td>
                        <td>{`${person.backup_info?.first_name || ''} ${person.backup_info?.last_name || ''}`}</td>
                        <td>
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: person.is_active ? 'green' : 'red',
                                }}
                                title={person.is_active ? 'Actif' : 'Inactif'}
                            />
                        </td>
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
                                <button 
                                    onClick={() => onResetPassword(person)} 
                                    title="Réinitialiser le mot de passe" 
                                    className={`${styles['actionBtn']} ${styles.reset}`}
                                >
                                    <FontAwesomeIcon icon={faKey} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    {/* MODIFIÉ : colSpan corrigé à 10 et message amélioré */}
                    <td colSpan={10} className={styles.noData}>
                        <div className={styles.noDataContent}>
                            <FontAwesomeIcon icon={faRocket} className={styles.noDataIcon} />
                            Aucune personne trouvée
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

export default PersonTable;
