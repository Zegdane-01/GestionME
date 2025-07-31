import React from 'react';
import { CheckCircle } from 'lucide-react';
import styles from '../../assets/styles/Dashboard/UpcomingDeadlines.module.css'; // On garde le CSS pour certains styles

const UpcomingDeadlinesTable = ({ data }) => {
  // Le cas où il n'y a pas de données reste similaire
  if (!data || data.length === 0) {
    return (
      <div className={styles.noDataContainer}>
        <CheckCircle size={32} className="text-success" />
        <p className="mt-2 text-muted">Aucune échéance de formation dans les 30 prochains jours.</p>
      </div>
    );
  }

 return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th scope="col">Formation</th>
            <th scope="col" className="text-center">Formés</th>
            <th scope="col">Progression par Activité</th> 
            <th scope="col">Deadline</th>
            <th scope="col" className="text-center">Jours Restants</th>
          </tr>
        </thead>
        <tbody>
          {data.map((formation, index) => {
            // ... (logique pour daysLeft et urgencyClass inchangée)
            const deadline = new Date(formation.deadline);
            const today = new Date();
            const daysLeft = Math.max(0, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
            
            let urgencyClass = 'text-success';
            if (daysLeft <= 15) urgencyClass = 'text-warning';
            if (daysLeft <= 7) urgencyClass = 'text-danger';

            return (
              <tr key={index}>
                <td>
                  <span className="fw-bold">{formation.titre}</span>
                </td>
                <td className="text-center">
                  <span className="badge bg-primary ">
                    {formation.total_completed} / {formation.total_enrolled}
                  </span>
                </td>
                
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    {formation.teams_progress.map((team, teamIndex) => {
                      const isTeamComplete = team.completed === team.total;
                      const teamBadgeClass = isTeamComplete ? 'bg-success text-black' : 'bg-warning text-black';
                      
                      return (
                        <span key={teamIndex} className={`badge ${teamBadgeClass}`}>
                          {team.name}: {team.completed} / {team.total}
                        </span>
                      );
                    })}
                  </div>
                </td>

                <td>
                  {deadline.toLocaleDateString('fr-FR', { /* ... */ })}
                </td>
                <td className={`text-center fw-bold ${urgencyClass}`}>
                  {daysLeft}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UpcomingDeadlinesTable;