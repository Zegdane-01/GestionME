import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TrainingList from './TrainingList';
import api from '../../api/api';
import styles from '../../assets/styles/Training/FormationBrowser.module.css';

const BackBtn = React.memo(({ onClick, label = 'Retour', icon = 'bi-arrow-left' }) => (
  <button 
    className="btn btn-outline-secondary mb-4 d-flex align-items-center gap-2" 
    onClick={onClick}
  >
    <i className={`bi ${icon}`} />
    {label}
  </button>
));

// --------- 2. Sélection des équipes améliorée ---------------------------
const TeamCard = React.memo(({ team, onSelect }) => (
  <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
    <div
      className={styles.card}
      onClick={() => onSelect(team)}
      onMouseEnter={e => e.currentTarget.classList.add(styles.hover)}
      onMouseLeave={e => e.currentTarget.classList.remove(styles.hover)}
    >
      {/* Badge rond bleu */}
      <div className={styles.badge}>
        {team.name ? team.name.charAt(0) : 'T'}
      </div>

      {/* Titre sur deux lignes */}
      <h5 className="fw-bold text-center mt-3 mb-1">
        Équipe<br />{team.name}
      </h5>

      {/* **Description générique – la même pour tout le monde** */}
      <p className="text-muted small text-center mb-3">Découvre et suis les formations adaptées à ton équipe</p>

      {/* Bouton d’action */}
      <button
        className="btn btn-outline-primary btn-sm mx-auto d-block"
        onClick={() => onSelect(team)}
      >
        Accéder aux formations
      </button>
    </div>
  </div>
));


const TeamSelector = ({ teams, onSelect }) => (
  <div className="container-fluid">
    {teams.length === 0 ? (
      <div className="text-center py-5">
        <i className="bi bi-inbox text-muted mb-3" style={{ fontSize: '3rem' }} />
        <p className="text-muted fs-5">Aucune équipe disponible</p>
      </div>
    ) : (
      <div className="row g-4">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} onSelect={onSelect} />
        ))}
      </div>
    )}
  </div>
);

// --------- 3. Sélection des domaines améliorée --------------------------
const DomainCard = React.memo(({ domain, onSelect }) => (
  <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
    <div
      className={styles.card}
      onClick={() => onSelect(domain)}
      onMouseEnter={e => e.currentTarget.classList.add(styles.hover)}
      onMouseLeave={e => e.currentTarget.classList.remove(styles.hover)}
    >
      {/* Badge rond – 1ʳᵉ lettre ou icône */}
      <div className={styles.badge}>
        {domain.name ? domain.name.charAt(0) : 'D'}
      </div>

      {/* Titre */}
      <h5 className="fw-bold text-center mt-3 mb-1">{domain.name}</h5>

      {/* Description générique */}
      <p className="text-muted small text-center mb-2">Formations spécialisées pour ce domaine</p>

      {/* Compteur de formations */}
      {domain.formation_count !== undefined && (
        <p className="small fw-semibold text-center mb-3">
          {domain.formation_count} formation{domain.formation_count !== 1 && 's'}
        </p>
      )}

      {/* Bouton */}
      <button
        className="btn btn-outline-primary btn-sm mx-auto d-block"
        onClick={() => onSelect(domain)}
      >
        Voir les formations
      </button>
    </div>
  </div>
));

const DomainSelector = ({ domains, onSelect, onBack, teamName }) => (
  <div className="container-fluid">
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
      <BackBtn onClick={onBack} label="Retour aux équipes" />
      <div className="text-muted">
        <i className="bi bi-folder me-1" />
        {domains.length} domaine{domains.length !== 1 && 's'} disponible{domains.length !== 1 && 's'}
      </div>
    </div>
    
    {domains.length === 0 ? (
      <div className="text-center py-5">
        <i className="bi bi-folder-x text-muted mb-3" style={{ fontSize: '3rem' }} />
        <p className="text-muted fs-5">Aucun domaine disponible pour cette équipe</p>
      </div>
    ) : (
      <div className="row g-4">
        {domains.map(domain => (
          <DomainCard key={domain.id} domain={domain} onSelect={onSelect} />
        ))}
      </div>
    )}
  </div>
);

// --------- 5. Orchestrateur principal amélioré --------------------------
const FormationBrowser = () => {
  const [step, setStep] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [allDomains, setAllDomains] = useState([]); 
  const [domains, setDomains] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Chargement initial des équipes
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setError(null);
        const [t,d] = await Promise.all([
          api.get('/equipes/'),
          api.get('/domains/')
        ]);
        setTeams(t.data);
        setAllDomains(d.data);
      } catch (err) {
        console.error('Erreur lors du chargement des équipes:', err);
        setError('Impossible de charger les équipes');
        toast.error('Impossible de charger les équipes');
      }
    };
    fetchTeams();
  }, []);

  // Gestionnaires d'événements
  const handleTeamSelect = async (team) => {
    setSelectedTeam(team);
    setDomains(
      (team.domains_info && team.domains_info.length)
        ? team.domains_info
        : allDomains.filter(d => (team.domains || []).includes(d.id))
    );
    setStep('domains');
  };

  const handleDomainSelect = (domain) => {
    navigate('/trainings', {
      state: {
        domainId: domain.id,
        domainName: domain.name,
      }
    }
    )
  };

  const handleBackToTeams = () => {
    setStep('teams');
    setSelectedTeam(null);
    setDomains([]);
  };

  const handleBackToDomains = () => {
    setStep('domains');
  };


  // Gestion des erreurs
  if (error && step === 'teams') {
    return (
      <div className={styles.dashboard}>
        <div className="text-center py-5">
          <i className="bi bi-exclamation-triangle text-warning mb-3" style={{ fontSize: '3rem' }} />
          <h4 className="text-muted mb-2">Erreur de chargement</h4>
          <p className="text-muted mb-4">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Rendu conditionnel selon l'étape
  const renderContent = () => {
    switch (step) {
      case 'teams':
        return <TeamSelector teams={teams} onSelect={handleTeamSelect} />;
      
      case 'domains':
        return (
          <DomainSelector
            domains={domains}
            onSelect={handleDomainSelect}
            onBack={handleBackToTeams}
            teamName={selectedTeam?.name}
          />
        );
      
      default:
        return null;
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'teams':
        return 'Choisissez une équipe';
      case 'domains':
        return 'Sélectionnez un domaine';
      case 'formations':
        return 'Formations disponibles';
      default:
        return 'Navigation';
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className="mb-4">
        <h1 className={styles.dashboardTitle}>Mes Formations</h1>
        <p className="text-muted fs-5 mb-3">{getSubtitle()}</p>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default FormationBrowser;