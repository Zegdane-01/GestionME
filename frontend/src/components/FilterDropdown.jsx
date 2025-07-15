import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import styles from './FilterDropdown.module.css'; // Assurez-vous d'utiliser le bon chemin

const FilterDropdown = ({ options, selectedOptions, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return;                // inutile d’écouter si déjà fermé

    function handleClickOutside(event) {
      // `contains` → vrai si le clic se fait dans l’élément référencé
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setIsOpen(false);               // 3. on ferme
      }
    }

    // On écoute le `mousedown` (ou `click`) globalement
    document.addEventListener('mousedown', handleClickOutside);
    // 4. nettoyage
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);


  const handleCheckboxChange = (option) => {
    // Crée une nouvelle liste de filtres
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option) // Décoche : on retire l'élément
      : [...selectedOptions, option]; // Coche : on ajoute l'élément
    
    onFilterChange(newSelection);
  };

  return (
    <div className={styles.filterWrapper}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.filterButton}>
        <FontAwesomeIcon icon={faFilter} style={{ color:'#fff' }} />
      </button>
      
      {isOpen && (
        <div ref={boxRef} className={styles.filterDropdown}>
          {options.map(option => (
            <label key={option} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
             { option || "Non attribué"}
              
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;