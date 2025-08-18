import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Bloc gauche */}
        <div className={styles.left}>
          <h4 className={styles.logo}>Expleo ME</h4>
          <p className={styles.tagline}>
            Excellence industrielle & innovation au service de vos projets.
          </p>
        </div>

        {/* Bloc liens */}
        <div className={styles.links}>
          <h5>Navigation</h5>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/dashboard">Tableau de bord</Link></li>
            <li><Link to="/collaborateurs">Collaborateurs</Link></li>
            <li><Link to="/projets">Projets</Link></li>
            <li><Link to="/formations">Formations</Link></li>
          </ul>
        </div>

        {/* Bloc contact */}
        <div className={styles.contact}>
          <h5>Contact</h5>
          <p>Email : <a href="mailto:contact@expleo.com">contact@expleo.com</a></p>
          <p>Tél : +212 5 39 00 00 00</p>
          <p>ERASMUS Tower • First Floor • Tanja Balia Road • Tangier 90000 • (Morocco)</p>
        </div>
      </div>

      {/* Bas de page */}
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Expleo ME — Tous droits réservés</p>
        <div className={styles.bottomLinks}>
          <Link to="/privacy">Politique de confidentialité</Link>
          <Link to="/legal">Mentions légales</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
