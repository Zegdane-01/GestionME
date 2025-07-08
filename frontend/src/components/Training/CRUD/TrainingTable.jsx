import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, faTrash, faPencilAlt, faRocket, faCheckCircle, faTimesCircle, 
    faChevronLeft, faChevronRight 
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/styles/Table.module.css';

const TrainingTable = ({ trainings, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Vous pouvez changer ce nombre
  const navigate = useNavigate();

  // NOUVEAU : Logique de calcul pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // On ne montre que les éléments de la page actuelle
  const currentTrainings = trainings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(trainings.length / itemsPerPage);

  // Fonction pour gérer le changement de page
  const handlePageChange = (pageNumber) => {
      // S'assurer que le numéro de page est dans les limites valides
      if (pageNumber >= 1 && pageNumber <= totalPages) {
          setCurrentPage(pageNumber);
      }
  };

  // Amélioration pour éviter la division par zéro
  const calculatePercentage = (passed, total) => {
      if (!total || total === 0) {
          return '0.00';
      }
      return ((passed / total) * 100).toFixed(2);
  };

    

  const handleView = (formationId) => {
    navigate(`/manager/trainings/progress/${formationId}`); // Replace with your actual route
    // Or navigate with state: navigate('/details', { state: { id: itemId } });
  };

 
  
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
          {currentTrainings.length > 0 ? (
            currentTrainings.map((training) => (
                <tr key={training.id} className={styles.dataRow}>
                    <td className={styles.nomCell}>{training.titre}</td>
                    <td>{training.domain_info?.name || ''}</td>
                    <td>{`${training.created_by_info?.last_name || ''} ${training.created_by_info?.first_name || ''}`}</td>
                    <td>{training.module_count}</td>
                    <td>{training.resource_count}</td>
                    <td>
                        <FontAwesomeIcon
                            icon={training.has_quiz ? faCheckCircle : faTimesCircle}
                            style={{ color: training.has_quiz ? 'green' : 'gray' }}
                            title={training.has_quiz ? "Quiz disponible" : "Pas de quiz"}
                        />
                    </td>
                    <td>
                        {training.passed_count}/{training.assigned_person_count}{' '}
                        <small>({calculatePercentage(training.passed_count, training.assigned_person_count)}%)</small>
                    </td>
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
                            <button onClick={() => handleView(training.id)} title="Voir" className={`${styles['actionBtn']} ${styles.view}`}>
                                <FontAwesomeIcon icon={faEye} />
                            </button>
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

export default TrainingTable;
