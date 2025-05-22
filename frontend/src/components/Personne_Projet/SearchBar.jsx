import React from 'react';
import { Form } from 'react-bootstrap';
import { Search } from 'lucide-react';
import styles from '../../assets/styles/SearchBar.module.css'; 
const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher..."
}) => {
  return (
    <div className={styles.posRelative}>
      <Form.Control
        className={`${styles.customSearch} ps-4`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <Search 
        className={styles.searchIcon}
        style={{ left: '0.5rem' }} 
        size={16} 
      />
    </div>
  );
};

export default SearchBar;
