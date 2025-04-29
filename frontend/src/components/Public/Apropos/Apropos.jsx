import React from 'react';
import './Apropos.css';
import NavBar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { BiBrain, BiUserCheck, BiRocket, BiShield } from 'react-icons/bi';

const Apropos = () => {
  return (
    <div className="about-page">
      <NavBar />
      
      {/* Bannière Hero */}
      <section className="about-hero position-relative overflow-hidden">
        <div className="container position-relative z-2 py-5 py-lg-6">
          <div className="row justify-content-center g-4">
            <div className="col-12 col-lg-10 col-xl-8 text-center">
              <h1 className="display-4 display-lg-3 fw-bold mb-3 gradient-title">
                Manufacturing Engineering <span className="text-underline d-inline-block">Expleo</span>
              </h1>
              <p className="lead fs-5 fs-lg-4 mb-4 mb-lg-5 text-light opacity-85">
                Réinventer l'industrie par l'innovation digitale et l'excellence opérationnelle
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <a href="#values" className="btn btn-primary btn-lg px-4 px-lg-5 py-3">
                  Découvrir
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Valeurs */}
      <section id="values" className="values-section py-5 py-lg-6">
        <div className="container">
          <div className="row d-flex justify-content-center">
          <div class="col-4 text-center">
            <h2 className="display-5 fw-bold mb-4 mb-lg-5">
              Nos <span className="text-primary">Valeurs</span>
            </h2>
          </div>
          </div>
          <div className="row g-4 g-lg-5 justify-content-center">
            {/* Carte Expertise */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="value-card bg-dark text-center p-3 p-lg-4 rounded-4 h-100 d-flex flex-column">
                <BiBrain className="value-icon fs-2 fs-lg-1 text-primary mb-3 mt-2 mx-auto" />
                <h3 className="mb-3 fs-5 fs-lg-4">Expertise Technique</h3>
                <p className="mb-3 fs-6 fs-lg-5">500+ ingénieurs spécialisés</p>
                <div className="stats-badge mt-auto">15 ans d'expérience</div>
              </div>
            </div>

            {/* Carte Client */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="value-card bg-dark text-center p-3 p-lg-4 rounded-4 h-100 d-flex flex-column">
                <BiUserCheck className="value-icon fs-2 fs-lg-1 text-primary mb-3 mt-2 mx-auto" />
                <h3 className="mb-3 fs-5 fs-lg-4">Approche Client</h3>
                <p className="mb-3 fs-6 fs-lg-5">95% de satisfaction</p>
                <div className="stats-badge mt-auto">200+ projets annuels</div>
              </div>
            </div>

            {/* Carte Innovation */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="value-card bg-dark text-center p-3 p-lg-4 rounded-4 h-100 d-flex flex-column">
                <BiRocket className="value-icon fs-2 fs-lg-1 text-primary mb-3 mt-2 mx-auto" />
                <h3 className="mb-3 fs-5 fs-lg-4">Innovation</h3>
                <p className="mb-3 fs-6 fs-lg-5">30 brevets déposés</p>
                <div className="stats-badge mt-auto">Lab R&D dédié</div>
              </div>
            </div>

            {/* Carte Qualité */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="value-card bg-dark text-center p-3 p-lg-4 rounded-4 h-100 d-flex flex-column">
                <BiShield className="value-icon fs-2 fs-lg-1 text-primary mb-3 mt-2 mx-auto" />
                <h3 className="mb-3 fs-5 fs-lg-4">Qualité</h3>
                <p className="mb-3 fs-6 fs-lg-5">Certifications ISO</p>
                <div className="stats-badge mt-auto">0 défaut critique</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mission-section py-5 py-lg-6">
        <div className="container">
          <div className="row g-5 g-lg-6 align-items-center">
            {/* Vidéo */}
            <div className="col-12 col-lg-6 order-lg-2">
              <div className="mission-video ratio ratio-16x9 rounded-4 overflow-hidden shadow-lg">
                <iframe 
                  src="https://www.youtube.com/embed/gN764ls8muc"
                  title="Revolutionise your manufacturing and assembly process - BuildSmart by Expleo"
                  allowFullScreen
                  className="bg-dark"
                ></iframe>
                </div>
            </div>
            
            {/* Contenu */}
            <div className="col-12 col-lg-6 order-lg-1">
              <div className="pe-lg-4">
                <h2 className="display-5 fw-bold mb-4 mb-lg-5">
                  Notre <span className="text-primary">Mission</span> Industrielle
                </h2>
                <ul className="mission-list list-unstyled">
                  <li className="mb-4 mb-lg-5">
                    <div className="d-flex align-items-start gap-3 gap-lg-4">
                      <div className="icon-wrapper d-flex justify-content-center align-items-center bg-primary text-white rounded-circle p-2 p-lg-3 flex-shrink-0">
                        <BiRocket size={24} />
                      </div>
                      <div>
                        <h4 className="fs-5 fs-lg-4 mb-2">Digitalisation des usines</h4>
                        <p className="fs-6 fs-lg-5 mb-0">Intégration IIoT et jumeaux numériques</p>
                      </div>
                    </div>
                  </li>
                  <li className="mb-4 mb-lg-5">
                    <div className="d-flex align-items-start gap-3 gap-lg-4">
                      <div className="icon-wrapper d-flex justify-content-center align-items-center bg-primary text-white rounded-circle p-2 p-lg-3 flex-shrink-0">
                        <BiBrain size={24} />
                      </div>
                      <div>
                        <h4 className="fs-5 fs-lg-4 mb-2">Optimisation continue</h4>
                        <p className="fs-6 fs-lg-5 mb-0">Méthodes Lean 4.0 et gestion de la valeur</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Méthodologies */}
      <section className="methods-section py-5 py-lg-6">
        <div className="container">
          <h2 className="display-5 fw-bold text-center mb-4 mb-lg-5">
            Notre <span className="text-primary">Approche</span> 
          </h2>
          <div className="row g-4 g-lg-5 justify-content-center">
            <div className="col-12 col-md-6 col-xl-4">
              <div className="method-card p-3 p-lg-4 rounded-4 h-100">
                <h3 className="h4 mb-3 d-flex align-items-center gap-2">
                  <BiRocket className="flex-shrink-0" />
                  Agile Industry
                </h3>
                <p className="mb-3 fs-6 fs-lg-5">Méthodologie adaptée aux projets dynamiques</p>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">✔ Revues techniques hebdomadaires</li>
                  <li className="mb-2">✔ Déploiement par MVP</li>
                  <li>✔ Adaptabilité client</li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <div className="method-card bg-primary-dark p-3 p-lg-4 rounded-4 h-100">
                <h3 className="h4 mb-3 d-flex align-items-center gap-2">
                  <BiRocket className="flex-shrink-0" />
                  Agile Industry
                </h3>
                <p className="mb-3 fs-6 fs-lg-5">Méthodologie adaptée aux projets dynamiques</p>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">✔ Revues techniques hebdomadaires</li>
                  <li className="mb-2">✔ Déploiement par MVP</li>
                  <li>✔ Adaptabilité client</li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <div className="method-card bg-primary-dark p-3 p-lg-4 rounded-4 h-100">
                <h3 className="h4 mb-3 d-flex align-items-center gap-2">
                  <BiRocket className="flex-shrink-0" />
                  Agile Industry
                </h3>
                <p className="mb-3 fs-6 fs-lg-5">Méthodologie adaptée aux projets dynamiques</p>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">✔ Revues techniques hebdomadaires</li>
                  <li className="mb-2">✔ Déploiement par MVP</li>
                  <li>✔ Adaptabilité client</li>
                </ul>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Apropos;