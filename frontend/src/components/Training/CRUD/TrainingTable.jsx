import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faInfo, faTrash, faPencilAlt, faRocket,
    faChevronLeft, faChevronRight 
} from '@fortawesome/free-solid-svg-icons';
import FilterDropdown from '../../FilterDropdown';
import styles from '../../../assets/styles/Table.module.css';

const TrainingTable = ({ trainings, onEdit, onDelete }) => {
    const deadlineOptions = ["Dépassée", "Non dépassée","Non attribué"];
    const quizOptions = ["Avec quiz", "Sans quiz"];
    const statutOptions = ["Disponible", "Archivée"];

    const [filters, setFilters] = useState({
        domain_info: [],
        created_by_info: [],
        formateur: [],
        has_quiz: [],
        deadline: [],
        statut: [],
    });
  
  const [filteredTrainings, setFilteredTrainings] = useState(trainings);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Vous pouvez changer ce nombre
  const navigate = useNavigate();


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // On ne montre que les éléments de la page actuelle
  const currentTrainings = filteredTrainings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(trainings.length / itemsPerPage);

  useEffect(() => {
    let data = [...trainings];

    // On filtre si le tableau de filtres pour une colonne n'est pas vide
    if (filters.domain_info.length > 0) {
      data = data.filter(t => filters.domain_info.includes(t.domain_info?.name));
    }
    if (filters.created_by_info.length > 0) {
      data = data.filter(t => filters.created_by_info.includes(`${t.created_by_info?.last_name || ''} ${t.created_by_info?.first_name || ''}`.trim()));
    }
    if (filters.formateur.length > 0) {
        data = data.filter(t => {
            const formateur = t.formateur ?? "__vide__"; // remplace null/undefined par un marqueur
            return filters.formateur.includes(formateur === "__vide__" ? "Non attribué" : formateur);
        });
    }
    if (filters.has_quiz.length > 0) {
        data = data.filter(t => {
            return filters.has_quiz.some(option => {
            if (option === "Avec quiz") return t.has_quiz === true;
            if (option === "Sans quiz") return t.has_quiz === false;
            return false;
            });
        });
    }
    if (filters.deadline.length > 0) {
        const today = new Date();

        data = data.filter(t => {
            const deadline = t.deadline ? new Date(t.deadline) : null;

            return filters.deadline.some(option => {
            if (option === "Dépassée") {
                return deadline && deadline < today;
            } else if (option === "Non dépassée") {
                return deadline && deadline >= today;
            }
            else  if (option === "Non attribué") return !t.deadline || t.deadline === null || t.deadline === "";
            return false;
            });
        });
    }
    if (filters.statut.length > 0) {
        data = data.filter(t => {
            return filters.statut.some(option => {
            if (option === "Disponible") return t.statut === 'actif';
            if (option === "Archivée") return t.statut === 'inactif';
            return false;
            });
        });
    }
    
    setFilteredTrainings(data);
  }, [filters, trainings]);

  const handleFilterChange = (column, selection) => {
    setFilters(prev => ({
      ...prev,
      [column]: selection,
    }));
  };

  // La génération des options reste la même
  const domainOptions = useMemo(() => [...new Set(trainings.map(t => t.domain_info?.name).filter(Boolean))], [trainings]);
  const creatorOptions = useMemo(() => [...new Set(trainings.map(t => `${t.created_by_info?.last_name || ''} ${t.created_by_info?.first_name || ''}`.trim()).filter(Boolean))], [trainings]);
  const formatorOptions = [...new Set(trainings.map(t => t.formateur ?? "__vide__"))]
                            .map(val => val === "__vide__" ? "Non attribué" : val);


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
      return ((passed / total) * 100).toFixed(0);
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
            <th>
                Domaine
                <FilterDropdown
                    options={domainOptions}
                    selectedOptions={filters.domain_info}
                    onFilterChange={(selection) => handleFilterChange('domain_info', selection)}
                />
            </th>
            <th>
                Créateur
                <FilterDropdown
                    options={creatorOptions}
                    selectedOptions={filters.created_by_info}
                    onFilterChange={(selection) => handleFilterChange('created_by_info', selection)}
                />
            </th>
            <th>
                Formateur
                <FilterDropdown
                    options={formatorOptions}
                    selectedOptions={filters.formateur}
                    onFilterChange={(selection) => handleFilterChange('formateur', selection)}
                />
            </th>
            <th>Nombre de Modules</th>
            <th>Nombre de Supports</th>
            <th>Activités assignées</th>
            <th>
                Présence du quiz
                <FilterDropdown
                    options={quizOptions}
                    selectedOptions={filters.has_quiz}
                    onFilterChange={(selection) => handleFilterChange("has_quiz", selection)}
                />
            </th>
            <th>
                Date limite
                <FilterDropdown
                    options={deadlineOptions}
                    selectedOptions={filters.deadline}
                    onFilterChange={(selection) => handleFilterChange("deadline", selection)}
                />
            </th>
            <th>Formés</th>
            <th>
                Statut
                <FilterDropdown
                    options={statutOptions}
                    selectedOptions={filters.statut}
                    onFilterChange={(selection) => handleFilterChange('statut', selection)}
                />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTrainings.length > 0 ? (
            currentTrainings.map((training) => {
                const statutLabel = {
                    actif:   "Disponible",
                    inactif: "Archivée", 
                }[training.statut] ?? training.statut;
                const couleur = training.statut === "actif" ? "#3cb371" : "#ff6347";
                return(
                <tr key={training.id} className={styles.dataRow}>
                    <td className={styles.nomCell}>{training.titre}</td>
                    <td><span className="badge bg-light text-dark">{training.domain_info?.name || ''}</span></td>
                    <td>{`${training.created_by_info?.last_name || ''} ${training.created_by_info?.first_name || ''}`}</td>
                    <td>
                        {training.formateur ? (
                            <span className="fw-semibold">{training.formateur}</span>
                        ) : (
                            <span className="text-muted fst-italic">Non attribué</span>
                        )}
                    </td>
                    <td>
                        <span className="badge bg-primary">
                            <strong>{training.module_count}</strong> module{training.module_count > 1 ? 's' : ''}
                        </span>
                    </td>
                    <td>
                        <span className="badge bg-primary">
                            <strong>{training.resource_count}</strong> ressource{training.resource_count > 1 ? 's' : ''}
                        </span>
                    </td>
                    <td>
                        <span className="badge bg-primary">
                            <strong>{training.assigned_team_count}</strong> activité{training.resource_count > 1 ? 's' : ''}
                        </span>
                    </td>
                    <td>
                        <span className={`badge ${training.has_quiz ? "bg-success" : "bg-secondary"}`}>
                            {training.has_quiz ? "✔ Quiz présent" : "✖ Aucun quiz"}
                        </span>
                    </td>
                    <td>
                        {training.deadline ? (
                            <span
                                style={{
                                    backgroundColor: new Date(training.deadline) > new Date() ? '#eef6ff' : '#ffdddd',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center'

                                }}
                                >
                                {new Date(training.deadline).toLocaleDateString('fr-FR')}
                            </span>
                        ) : (
                            <span className="text-muted fst-italic">Non attribué</span>
                        )}
                    </td>
                    <td>
                        <strong>{training.passed_count}</strong> / {training.assigned_person_count}
                        <br />
                        <small style={{ color: 'gray' }}>
                            {calculatePercentage(training.passed_count, training.assigned_person_count)}%
                        </small>
                    </td>
                    <td>
                        <span
                        className={styles.badge}
                        style={{
                            backgroundColor: couleur,
                            color: "#fff",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                        }}
                        >
                        {statutLabel}
                        </span>
                    </td>
                    <td className={styles.actionsCell}>
                        <div className={styles.actionGroup}>
                            <button onClick={() => handleView(training.id)} title="Voir" className={`${styles['actionBtn']} ${styles.view}`}>
                                <FontAwesomeIcon icon={faInfo} />
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
            )})
          ) : (
            <tr>
                <td colSpan={12} className={styles.noData}>
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
