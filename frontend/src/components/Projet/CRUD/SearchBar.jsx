import React from 'react';
import { Form } from 'react-bootstrap';
import { Search } from 'lucide-react';
import './SearchBar.css'; 

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher..."
}) => {
  return (
    <div className="position-relative">
      <Form.Control
        className="ps-5 custom-search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <Search 
        className="position-absolute top-50 translate-middle-y ms-2 search-icon"
        style={{ left: '0.5rem' }} 
        size={16} 
      />
    </div>
  );
};

export default SearchBar;
