import React from 'react';
import styles from './EquipeDetail.module.css';

const EquipeDetail = ({ equipe }) => {
  if (!equipe) {
    return (
      <div className={styles.noProjectSelected}>
        <i className="bi bi-exclamation-circle"></i>
        <p>Aucune équipe sélectionnée.</p>
      </div>
    );
  }

  const FieldRow = ({ label, value, icon }) => (
    <div className={styles.fieldRow}>
      <div className={styles.fieldLabel}>
        {icon && <i className={`bi bi-${icon} ${styles.fieldIcon}`}></i>}
        {label}
      </div>
      <div className={styles.fieldValue}>
        {value ? value : '—'}
      </div>
    </div>
  );

  return (
    <div className={styles.projetDetailContainer}>
      <div className={styles.projetHeader}>
        <h3 className={styles.projetTitle}>{equipe.name}</h3>
      </div>

      <FieldRow
        label="Membres assignés"
        icon="people-fill"
        value={
          (equipe.assigned_users_info?.length > 0) ? (
            <ul className={styles.scrollList}>
              {equipe.assigned_users_info.map((user) => (
                <li key={user.maticule}>
                  {user.first_name} {user.last_name}
                </li>
              ))}
            </ul>
          ) : 'Aucun membre assigné'
        }
      />

      <FieldRow
        label="Domaines liés"
        icon="diagram-3-fill"
        value={
          (equipe.domains_info?.length > 0) ? (
            <ul className={styles.scrollList}>
              {equipe.domains_info.map((domain) => (
                <li key={domain.id}>{domain.name}</li>
              ))}
            </ul>
          ) : 'Aucun domaine lié'
        }
      />
    </div>
  );
};

export default EquipeDetail;
