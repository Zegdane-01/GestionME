import React from 'react';
import NosClients from '../NosClients/NosClients';
import Quote_Ilham from '../Quote_Ilham/Quote_Ilham';
import Engagement from '../Engagement/Engagement';
import './Presentation.css'; 
function Presentation() {
  return (
    <section>
      <div className="hero">
        <div className=" background-elements"></div>
        <div className="hero-content">
          <h1 className="hero-title">Portail Manufacturing Engineering d'Expleo</h1>
          <p className="hero-text">
          Notre plateforme dédiée au département Manufacturing Engineering d'Expleo centralise et optimise la gestion de vos projets industriels et de vos ressources techniques.
          </p>
          <div className="mt-4">
            <a href="/login" className="btn btn-primary btn-lg px-5 py-3">
              Se connecter
            </a>
          </div>
        </div>
      </div>
      
      <Quote_Ilham />
      <NosClients />
  
    </section>
  );
}

export default Presentation;