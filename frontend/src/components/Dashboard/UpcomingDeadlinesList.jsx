import React from 'react';
import { Calendar, Users, CheckCircle } from 'lucide-react';
import styles from '../../assets/styles/Dashboard/UpcomingDeadlines.module.css'; // Créez ce fichier CSS

const UpcomingDeadlinesList = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.noDataContainer}>
        <CheckCircle size={32} className="text-success" />
        <p className="mt-2 text-muted">Aucune échéance de formation dans les 30 prochains jours.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {data.map((formation, index) => {
        const deadline = new Date(formation.deadline);
        const today = new Date();
        const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        
        let urgencyColor = 'text-success';
        if (daysLeft <= 15) urgencyColor = 'text-warning';
        if (daysLeft <= 7) urgencyColor = 'text-danger';

        return (
          <div key={index} className={styles.listItem}>
            <div className={styles.header}>
              <h6 className={styles.title}>{formation.titre}</h6>
              <span className={`${styles.daysLeft} ${urgencyColor}`}>
                <Calendar size={14} className="me-1" />
                {daysLeft}-J
              </span>
            </div>
            <div className={styles.stats}>
              <Users size={14} className="me-1" />
              <span>
                <strong>{formation.total_completed}</strong> / {formation.total_enrolled} terminées
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingDeadlinesList;