import React from 'react';

const PersonDetail = ({ person }) => {
  console.log("Détails de la personne:", person.photo); 
  if (!person) {
    return <p>Aucune personne sélectionnée.</p>;
  }

  return (
    <div style={ { maxWidth: '100%', margin: '0 auto' }} className="p-4 border rounded shadow-sm bg-white">
      {person.photo && (
        <div className="text-center mb-4">
          <img
            src={person.photo}
            alt="Photo"
            style={{ maxWidth: '150px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Matricule :</div>
        <div className="col-sm-6"><span className="text-break">{person.matricule}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Nom :</div>
        <div className="col-sm-6"><span className="text-break">{person.last_name}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Prénom :</div>
        <div className="col-sm-6"><span className="text-break">{person.first_name}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Email :</div>
        <div className="col-sm-6"><span className="text-break">{person.email}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Date d'embauche :</div>
        <div className="col-sm-6"><span className="text-break">{person.dt_Embauche}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Sexe :</div>
        <div className="col-sm-6"><span className="text-break">{person.sexe}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Position :</div>
        <div className="col-sm-6"><span className="text-break">{person.position}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Téléphone :</div>
        <div className="col-sm-6"><span className="text-break">{person.telephone}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Type :</div>
        <div className="col-sm-6"><span className="text-break">{person.I_E}</span></div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Status :</div>
        <div className="col-sm-6"><span className="text-break">{person.status}</span></div>
      </div>
      <hr className="my-2" />

      {person.cv && (
        <>
          <div className="row">
            <div className="col-sm-6 text-secondary fw-bold">CV :</div>
            <div className="col-sm-6">
              <a href={person.cv} target="_blank" rel="noopener noreferrer">
                Voir le CV
              </a>
            </div>
          </div>
          <hr className="my-2" />
        </>
      )}

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Actif :</div>
        <div className="col-sm-6">{person.is_active ? 'Oui' : 'Non'}</div>
      </div>
    </div>
  );
};

export default PersonDetail;
