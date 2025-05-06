import React from 'react';

const PersonDetail = ({ person }) => {
  if (!person) {
    return <p>Aucune personne sélectionnée.</p>;
  }

  return (
    <div>
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Matricule:</div>
        <div className="col-sm-8">{person.matricule}</div>
      </div>
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Nom:</div>
        <div className="col-sm-8">{person.last_name}</div>
      </div>
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Prénom:</div>
        <div className="col-sm-8">{person.first_name}</div>
      </div>
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Email:</div>
        <div className="col-sm-8">{person.email}</div>
      </div>
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Rôle:</div>
        <div className="col-sm-8">{person.role}</div>
      </div>
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Date d'Embauche:</div>
        <div className="col-sm-8">{person.dt_Embauche}</div>
      </div>
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Sexe:</div>
        <div className="col-sm-8">{person.sexe}</div>
      </div>
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Position:</div>
        <div className="col-sm-8">{person.position}</div>
      </div>
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Téléphone:</div>
        <div className="col-sm-8">{person.telephone}</div>
      </div>
      <hr className="my-2" />
      {person.cv && (
        <div className="row">
          <div className="col-sm-4 text-secondary fw-bold">CV:</div>
          <div className="col-sm-8">
            <a href={person.cv} target="_blank" rel="noopener noreferrer">
              Voir le CV
            </a>
          </div>
        </div>
      )}
      <hr className="my-2" />
      <div className="row">
        <div className="col-sm-4 text-secondary fw-bold">Actif:</div>
        <div className="col-sm-8">{person.is_active ? 'Oui' : 'Non'}</div>
      </div>
    </div>
  );
};

export default PersonDetail;