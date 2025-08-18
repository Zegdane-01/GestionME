import React from 'react';
import { Globe, Users, HardHat, Car, Plane, Ship, CheckCircle } from 'lucide-react';
import styles from '../../assets/styles/HomePage/HomePage.module.css'; // Créez ce fichier CSS
import FlipCard from '../../components/Public/Apropos/FlipCard/FlipCard.jsx';
import Quote_Ilham from '../../components/Public/HomePage/Quote_Ilham/Quote_Ilham';
import NosClient from '../../components/Public/HomePage/NosClients/NosClients.jsx';
import Footer from '../../components/Public/Footer/Footer.jsx'
import vd_back from '../../assets/vd_background.mp4';
import img1 from '../../assets/images/flipCards/Manuf_Process.png';
import img2 from '../../assets/images/flipCards/Manu_methods.png';
import img3 from '../../assets/images/flipCards/Installation.png';
import img4 from '../../assets/images/flipCards/Industrial_process.png'
// Sous-composant pour les cartes de statistiques
const StatCard = ({ icon, value, label }) => (
  <div className={styles.statCard}>
    {icon}
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

// Sous-composant pour les cartes de secteur d'activité
const SectorCard = ({ icon, title, percentage }) => (
  <div className={styles.sectorCard}>
    <div className={styles.sectorIcon}>{icon}</div>
    <div className={styles.sectorInfo}>
      <div className={styles.sectorTitle}>{title}</div>
      <div className={styles.sectorPercentage}>{percentage}</div>
    </div>
  </div>
);

// Composant principal de la page d'accueil
const HomePage = () => {
    const videoUrl = vd_back;
    const processContent = (
    <ul className="list-unstyled">
      <li>✔ Gestion de projet</li>
      <li>✔ Process FMEA</li>
      <li>✔ Lean Manufacturing</li>
    </ul>
    );

    const methodsContent =(
        <ul className="list-unstyled">
            <li>✔ Gammes de montage</li>
            <li>✔ Calcul de temps</li>
            <li>✔ Ergonomie</li>
        </ul>
    );

    const InstallationContent =(
        <ul className="list-unstyled">
            <li>✔ Gestion des fourinisseurs</li>
            <li>✔ Coordination de site</li>
            <li>✔ Convergence Qualité</li>
        </ul>
    );

    const AutomatisationContent =(
        <ul className="list-unstyled">
            <li>✔ Programmation PLC</li>
            <li>✔ Simulation robotique</li>
            <li>✔ Manufacturing Execution System</li>
        </ul>
    );
  return (
    <>
    <div className={styles.homePage}>
      
      {/* SECTION HÉROS */}
      <header className={styles.heroSection}>
        <video src={videoUrl} autoPlay loop muted className={styles.heroVideoBackground} />
      </header>
      

      {/* SECTION STATISTIQUES CLÉS */}
      <section className={styles.statsSection}>
        <StatCard icon={<Users size={40} />} value="1400+" label="Collaborateurs" />
        <StatCard icon={<Globe size={40} />} value="8" label="Pays d'intervention" />
        <StatCard icon={<HardHat size={40} />} value="6" label="Centres d'excellence" />
      </section>
      
      <NosClient />
      <Quote_Ilham />

      {/* SECTION EXPERTISES */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Nos Domaines d'Expertise</h2>
          <div className="row g-4">
            <FlipCard
              title="Développement de Processus"
              image={img1}
              content={processContent}
            />

            <FlipCard
              title="Méthodes & Maintenance"
              image={img2}
              content={methodsContent}
            />

            <FlipCard
              title="Installation & Mise en Service"
              image={img3}
              content={InstallationContent}
            />

            <FlipCard
              title="Automatisation des Processus"
              image={img4}
              content={AutomatisationContent}
            />
          </div>
      </section>

      {/* SECTION SECTEURS D'ACTIVITÉ */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Nos Secteurs d'Activité</h2>
        <div className={styles.sectorsContainer}>
          <SectorCard icon={<Plane size={32} />} title="Aéronautique" percentage="50%" />
          <SectorCard icon={<Car size={32} />} title="Automobile" percentage="30%" />
          <SectorCard icon={<Ship size={32} />} title="Autres (Naval, Défense...)" percentage="15%" />
          <SectorCard icon={<Users size={32} />} title="Transports" percentage="5%" />
        </div>
      </section>

    </div>
    <Footer />
    </>
  );
};

export default HomePage;