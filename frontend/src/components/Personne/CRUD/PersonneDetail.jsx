import React from 'react';

const PersonDetail = ({ person }) => {
  if (!person) {
    return <p>Aucune personne sélectionnée.</p>;
  }

  const FieldRow = ({ label, value }) => (
    <>
      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">{label} :</div>
        <div className="col-sm-6 text-break">{value ?? '—'}</div>
      </div>
      <hr className="my-2" />
    </>
  );
  const getExperienceText = (totalMonths) => {
    
        if (typeof totalMonths !== 'number' || isNaN(totalMonths) || totalMonths < 0) {
            return '0 ans, 0 mois';
        }
        
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        
        return `${years} an${years > 1 ? 's' : ''}, ${months} mois`;
    };


  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }} className="p-4 border rounded shadow-sm bg-white">
      {person.photo && (
        <div className="text-center mb-4">
          <img
            src={person.photo}
            alt="Photo"
            style={{ maxWidth: '150px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      )}

      <FieldRow label="Matricule" value={person.matricule} />
      <FieldRow label="Nom" value={person.last_name} />
      <FieldRow label="Prénom" value={person.first_name} />
      <FieldRow label="Email" value={person.email} />
      <FieldRow label="Téléphone" value={person.telephone} />
      <FieldRow label="Sexe" value={person.sexe} />
      <FieldRow label="Position" value={person.position} />
      <FieldRow label="Status" value={person.status} />
      <FieldRow label="Diplôme" value={person.diplome} />
      <FieldRow label="Spécialité diplôme" value={person.specialite_diplome} />
      <FieldRow label="Date début carrière" value={person.dt_Debut_Carriere} />
      <FieldRow label="Date embauche" value={person.dt_Embauche} />
      
      <FieldRow label="Expérience totale" value={getExperienceText(person.experience_total)} />
      <FieldRow label="Expérience Expleo" value={getExperienceText(person.experience_expleo)}  />
      <FieldRow label="Manager" value={`${person.manager_info.first_name} ${person.manager_info.last_name}`} />
      <FieldRow label="Backup" value={`${person.backup_info.first_name} ${person.backup_info.last_name}`} />
      <FieldRow label="Projet" value={person.projet} />
      <>
        <div className="row">
          <div className="col-sm-6 text-secondary fw-bold">DDC :</div>
          <div className="col-sm-6">
            <a href={person.ddc} rel="noopener noreferrer" download>Télécharger le document</a>
          </div>
        </div>
        <hr className="my-2" />
      </>
      <FieldRow
        label="Actif"
        value={
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: person.is_active ? 'green' : 'red',
                marginLeft: '8px',
              }}
              title={person.is_active ? 'Actif' : 'Inactif'}
            />
        }
      />
    </div>
  );
};

export default PersonDetail;
