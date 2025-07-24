import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';
import StatusDonutChart from '../../components/Dashboard/StatusDonutChart'; 
import ProfileHorizontalBarChart from '../../components/Dashboard/ProfileHorizontalBarChart';
import HeadcountByClientPieChart from '../../components/Dashboard/HeadcountByClientPieChart';
import PositionBarChart from '../../components/Dashboard/PositionBarChart';
import ExperienceBarChart from '../../components/Dashboard/ExperienceBarChart';
import DiplomaDonutChart from '../../components/Dashboard/DiplomaDonutChart';
import ProjectStatusDonutChart from '../../components/Dashboard/ProjectStatusDonutChart';
import UpcomingDeadlinesList from '../../components/Dashboard/UpcomingDeadlinesList';
import styles from '../../assets/styles/Dashboard/DashboardCharts.module.css';

const Loader = () => <div>Chargement du tableau de bord...</div>;

const DashboardFilter = ({ label, options, value, onChange }) => (
  <div className="flex-grow-1">
    <label className="form-label small text-muted">{label}</label>
    <select 
      className="form-select" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Tout</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    profile: '',
    status: '',
    client: '',
    equipe: '',
    sop: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/personne/stats/?${params}`); // Appel à notre nouvel endpoint
        setDashboardData(response.data);
      } catch (error) {
        toast.error("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  if (loading) {
    return <Loader />;
  }
  
  if (!dashboardData) {
    return <div>Aucune donnée à afficher.</div>;
  }

return (
  <div className={styles.dashboard}>
    <h1 className={styles.title}>ME GLOBAL</h1>
     <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap gap-3">
          <DashboardFilter 
            label="Par profil"
            options={dashboardData.filters?.profiles || []}
            value={filters.profile}
            onChange={(value) => handleFilterChange('profile', value)}
          />
          <DashboardFilter 
            label="Par statut"
            options={dashboardData.filters?.statuses || []}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          />
          <DashboardFilter 
            label="Par Client"
            options={dashboardData.filters?.clients || []}
            value={filters.client}
            onChange={(value) => handleFilterChange('client', value)}
          />
          <DashboardFilter 
            label="Par équipe"
            options={dashboardData.filters?.equipes || []}
            value={filters.equipe}
            onChange={(value) => handleFilterChange('equipe', value)}
          />
          <DashboardFilter 
            label="Par I/E"
            options={dashboardData.filters?.sops || []}
            value={filters.sop}
            onChange={(value) => handleFilterChange('sop', value)}
          />
        </div>
      </div>

    {/* ======== GRID PRINCIPALE ======== */}
    <div className={styles.grid}>
      {/* Statut collaborateurs */}
      <section className={`${styles.card} ${styles.cardSpan2Rows}`}>
        <h3 className={styles.cardTitle}>Statut des collaborateurs</h3>
          <div className={styles.centerBody}>
            <StatusDonutChart data={dashboardData.collaborator_stats} />
          </div>
      </section>


      {/* Radar profils */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Répartition par type de profils</h3>
        <div className={styles.centerBody}>
          <ProfileHorizontalBarChart data={dashboardData.profile_distribution} />
        </div>
      </section>

      {/* Niveaux */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Répartition par Position</h3>
        <div className={styles.centerBody}>
          <PositionBarChart data={dashboardData.headcount_by_position} />
        </div>
      </section>

      {/* Headcount par client */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Headcount par Client</h3>
        <div className={styles.centerBody}>
          <HeadcountByClientPieChart data={dashboardData.headcount_by_client} />
        </div>
      </section>

      {/* Répartition par Niveau d'Expérience */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Répartition par Niveau d'Expérience</h3>
        <div className={styles.centerBody}>
          <ExperienceBarChart data={dashboardData.experience_distribution} />
        </div>
      </section>

      {/* Statut des Projets */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Statut des Projets</h3>
        <div className={styles.centerBody}>
          <ProjectStatusDonutChart data={dashboardData.project_status_distribution} />
        </div>
      </section>

      {/* Répartition par Niveau de Diplôme */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Répartition par Niveau de Diplôme</h3>
        <div className={styles.centerBody}>
          <DiplomaDonutChart data={dashboardData.diploma_distribution} />
        </div>
      </section>

      {/* Formations avec Échéance Proche*/}
      <section className={`${styles.card} ${styles.cardSpan2}`}>
        <h3 className={styles.cardTitle}>Formations avec Échéance Proche</h3>
        <UpcomingDeadlinesList data={dashboardData.upcoming_deadlines} />
      </section>
    </div>
  </div>
);
};

export default DashboardPage;