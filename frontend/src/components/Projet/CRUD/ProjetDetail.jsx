import React from 'react';
import styles from './ProjetDetail.module.css';

const ProjetDetail = ({ projet }) => {
  if (!projet) return (
    <div className={styles.noProjectSelected}>
      <i className="bi bi-exclamation-circle"></i>
      <p>Aucun projet sélectionné.</p>
    </div>
  );

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
        <h3 className={styles.projetTitle}>{projet.nom}</h3>
        <span className={styles.projetCode}>{projet.code}</span>
      </div>
      <FieldRow label="Ordre de travail" value={projet.ordre_travail} icon="clipboard-check" />
      <FieldRow label="Client final" value={projet.final_client} icon="building-fill" />
      <FieldRow
        label="SOP"
        value={
          <span className={`${styles.sopBadge} ${styles[`sop${projet.sop.replace(/\s+/g, '')}`]}`}>
            {projet.sop}
          </span>
        }
        icon="diagram-2" />
      <FieldRow label="IBU" value={projet.ibu} icon="briefcase" />
      <FieldRow label="CBU" value={projet.cbu} icon="briefcase-fill" />
      <FieldRow 
        label="Team Leader" 
        value={projet.tl_info?.first_name ? `${projet.tl_info?.first_name} ${projet.tl_info?.last_name}` : '—'}
        icon="person-fill" 
      />
      <FieldRow label="Chef de projet" value={projet.chef_de_projet} icon="person-badge" />
      <FieldRow 
        label="Date de démarrage" 
        value={new Date(projet.date_demarrage).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })} 
        icon="calendar-date" 
      />
      <FieldRow 
        label="Statut" 
        value={
          <span className={`${styles.statusBadge} ${styles[`status${projet.statut?.replace(/\s+/g, '')}`]}`}>
            {projet.statut}
          </span>
        } 
        icon="check-circle" 
      />
      <FieldRow label="Description" value={projet.descriptif} icon="file-text" />
    </div>
  );
};

export default ProjetDetail;
