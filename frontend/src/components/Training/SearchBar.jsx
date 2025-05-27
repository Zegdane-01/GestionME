import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange }) => (
  <div className="position-relative flex-grow-1 me-3">
    <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
    <input
      className="form-control ps-5"
      placeholder="Rechercher une formation..."
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
