import React from 'react';

export default function AproposME() {
  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">À propos du département Manufacturing Engineering</h1>
        <p className="lead">
          Découvrez notre mission, notre équipe et nos méthodes qui façonnent l'excellence industrielle chez Expleo.
        </p>
      </div>

      {/* Notre Mission */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-primary">Notre Mission</h2>
          <p className="card-text">
            Le département Manufacturing Engineering d’Expleo a pour mission de garantir l’industrialisation efficace des produits,
            en assurant qualité, innovation et respect des délais. Nous accompagnons nos clients dans la transformation digitale
            de leurs processus industriels tout en renforçant la compétitivité par l’excellence opérationnelle.
          </p>
          <p className="card-text">
            Notre vision repose sur l'innovation technologique, la fiabilité des processus, et l'humain au cœur de la performance.
            Depuis sa création, le département n’a cessé d’évoluer pour répondre aux défis de l’industrie 4.0, en intégrant les meilleures
            pratiques et outils du marché.
          </p>
        </div>
      </div>

      {/* Notre Équipe */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-primary">Notre Équipe</h2>
          <p className="card-text">
            Notre équipe est composée d'ingénieurs, techniciens et experts pluridisciplinaires dotés de certifications reconnues
            (Lean Six Sigma, PMP, CATIA, etc.). Nous favorisons une culture de collaboration, de partage de savoirs et d’amélioration continue.
          </p>
          <p className="card-text">
            La structure de l’équipe est agile et orientée projet, permettant une adaptation rapide aux besoins des clients,
            en garantissant réactivité et performance.
          </p>
        </div>
      </div>

      {/* Nos Méthodologies */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-primary">Nos Méthodologies</h2>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <strong>Approche projet :</strong> Utilisation de méthodologies adaptées selon le contexte – Agile, Waterfall ou Hybride.
            </li>
            <li className="list-group-item">
              <strong>Amélioration continue :</strong> Mise en œuvre du Lean Manufacturing et de la démarche Kaizen pour optimiser les processus.
            </li>
            <li className="list-group-item">
              <strong>Gestion des connaissances :</strong> Capitalisation des savoirs via des outils collaboratifs et documentation rigoureuse.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
