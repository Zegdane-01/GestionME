// src/components/StatsSummary.jsx
import React from 'react';
import {
  LayoutGrid,      // total
  Trophy,          // terminées
  RefreshCw,       // en cours
  Sparkles         // nouvelles
} from 'lucide-react';
import styles from '../../assets/styles/Training/StatsSummary.module.css';

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className={`card flex-grow-1 ${styles.card}`}>
    <div className="card-body d-flex align-items-center gap-3">
      <div className={`${styles.iconWrap}`} style={{ backgroundColor: color }}>
        <Icon size={18} />
      </div>
      <div>
        <h4 className="mb-0">{value}</h4>
        <small className="text-muted">{label}</small>
      </div>
    </div>
  </div>
);

const StatsSummary = ({ stats }) => (
  <div className="d-flex flex-wrap gap-3 mb-4">
    <StatCard icon={LayoutGrid} value={stats.total}      label="Total"       color="rgba(59,130,246,.15)" />
    <StatCard icon={Trophy}      value={stats.completed}  label="Terminées"  color="rgba(234,179,8,.15)" />
    <StatCard icon={RefreshCw}   value={stats.inProgress} label="En cours"   color="rgba(34,197,94,.15)" />
    <StatCard icon={Sparkles}    value={stats.new}        label="Nouvelles"  color="rgba(192,132,252,.15)" />
  </div>
);

export default StatsSummary;
