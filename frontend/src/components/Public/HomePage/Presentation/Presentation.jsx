import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FlipCard from './FlipCard';
import NosClients from '../NosClients/NosClients';
import processImage from '../../../../assets/images/Optimisation_des_Processus_FlipCard.jpg'; 
import conceptionImage from '../../../../assets/images/Conception_Industrialisation_FlipCard.jpg'; 
import managementImage from '../../../../assets/images/Management_Collaboration_FlipCard.jpg'; 
import './Presentation.css'; 
function Presentation() {
    const processContent = (
      <ul className="list-unstyled">
        <li>✔ Lean Manufacturing et SMED</li>
        <li>✔ Automatisation industrielle (OT/IT)</li>
        <li>✔ Analyse de données de production</li>
        <li>✔ Gestion des flux matières</li>
        <li>✔ Amélioration continue (Kaizen)</li>
      </ul>
      );
    const ConceptionContent= (
      <ul className="list-unstyled">
        <li>✔ Ingénierie produit et process</li>
        <li>✔ Prototypage rapide et jumeaux numériques</li>
        <li>✔ Déploiement de lignes de production</li>
      </ul>
    )
    const managementContent = (
      <ul className="list-unstyled">
        <li>✔ Suivi de projets cross-fonctionnels</li>
        <li>✔ Gestion des ressources techniques</li>
        <li>✔ Tableaux de bord QCD (Qualité-Coût-Délai)</li>
      </ul>
    )
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
      <NosClients />
      <div className="mt-5">
          <h2  className="section-title text-center">
            Nos Expertises Clés
          </h2>
      <div className="row g-4 m-5">
        <FlipCard
          title="Conception & Industrialisation"
          image={conceptionImage}
          content={ConceptionContent}
        />

        <FlipCard
          title="Optimisation des Processus"
          image={processImage}
          content={processContent}
        />

        <FlipCard
          title="Management & Collaboration"
          image={managementImage}
          content={managementContent}
        />
      </div>
      </div>

      <div className="section-bg text-center text-white">
        <h2  className="section-title text-white">
          Notre Engagement Industriel
        </h2>
        <p className="mb-0">
          Chez Expleo, nous intégrons les dernières innovations en Manufacturing Engineering :
          IA industrielle, IoT de production, réalité augmentée pour la maintenance,
          et solutions durables d'éco-conception. Notre approche PLM (Product Lifecycle Management)
          couvre l'ensemble du cycle de vie produit, de la conception à la recyclabilité.
        </p>
      </div>

    </section>
  );
}

export default Presentation;