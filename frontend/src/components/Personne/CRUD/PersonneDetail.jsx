import React from 'react';

const PersonDetail = ({ person }) => {
  if (!person) {
    return <p>Aucune personne sélectionnée.</p>;
  }

  return (
    <div>
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
        <div className="col-sm-6">{person.matricule}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Nom :</div>
        <div className="col-sm-6">{person.last_name}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Prénom :</div>
        <div className="col-sm-6">{person.first_name}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Email :</div>
        <div className="col-sm-6">{person.email}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Date d'embauche :</div>
        <div className="col-sm-6">{person.dt_Embauche}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Sexe :</div>
        <div className="col-sm-6">{person.sexe}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Position :</div>
        <div className="col-sm-6">{person.position}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Téléphone :</div>
        <div className="col-sm-6">{person.telephone}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Type :</div>
        <div className="col-sm-6">{person.I_E}</div>
      </div>
      <hr className="my-2" />

      <div className="row">
        <div className="col-sm-6 text-secondary fw-bold">Status :</div>
        <div className="col-sm-6">{person.status}</div>
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
