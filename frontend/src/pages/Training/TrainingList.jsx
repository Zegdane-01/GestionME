import React, { useState } from 'react';

import { trainings as mock } from '../../data/trainings';
import TrainingCard from '../../components/Training/TrainingCard';
import StatsSummary from '../../components/Training/StatsSummary';
import SearchBar from '../../components/Training/SearchBar';
import FilterSelect from '../../components/Training/FilterSelect';

const TrainingList = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('recent');
  
  // ─── calcul des stats globales ──────────────────────────────────────────
  const stats = {
    total:       mock.length,
    completed:   mock.filter(t => t.status === 'completed').length,
    inProgress:  mock.filter(t => t.status === 'in_progress').length,
    new:         mock.filter(t => t.status === 'new').length
  };

  // ─── filtre + tri ────────────────────────────────────────────────────────────
  const filtered = mock
    .filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'all' || category === t.status)
    )
    .sort((a, b) =>
      sort === 'recent' ? b.id - a.id : a.title.localeCompare(b.title)
    );


  return (
    <div className="container py-4">
        <h2 className="mb-4">Formations</h2>
    {/* ─── Bandeau stats ─────────────────────────────────────────────── */}
      <StatsSummary stats={stats} />
      {/* Top bar */}
      <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
        <SearchBar value={search} onChange={setSearch} />
        <FilterSelect
          value={category}
          onChange={setCategory}
          options={[
            { value: 'all', label: 'Toutes' },
            { value: 'new', label: 'Nouvelles' },
            { value: 'in_progress', label: 'En cours' },
            { value: 'completed', label: 'Terminées' }
          ]}
        />
        <FilterSelect
          value={sort}
          onChange={setSort}
          className="ms-2"
          options={[
            { value: 'recent', label: 'Plus récentes' },
            { value: 'alpha', label: 'A → Z' }
          ]}
        />
      </div>

      <p className="mb-4">{filtered.length} formations trouvées</p>

      {/* Cards */}
      <div className="row g-4">
        {filtered.map(t => (
          <div className="col-md-4" key={t.id}>
            <TrainingCard training={t} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingList;