import React from 'react';

const FilterSelect = ({ options, value, onChange }) => (
  <select className="form-select w-auto" value={value} onChange={e => onChange(e.target.value)}>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

export default FilterSelect;
