import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import { getUserRole, getUserId } from "../../services/auth.js";
import { Table } from "react-bootstrap";
import { User, BarChart3, Table2, BrainCircuit } from "lucide-react";
import styles from "../../assets/styles/Radar/Radar.module.css"; // ← ton fichier CSS local

/* ------------------------------ Chart.js ------------------------------ */
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);
/* --------------------------------------------------------------------- */

const RadarCompetence = () => {
  /* ---------------------------- STATES --------------------------- */
  const [viewMode, setViewMode] = useState("radar");
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [projets, setProjets] = useState([]);
  
  const role      = getUserRole();   
  const myUserId  = getUserId();  
  const me = users.find(u => u.matricule === myUserId);

  const [selectedUser, setSelectedUser]     = useState("");
  const [selectedEquipe, setSelectedEquipe] = useState("");
  const [selectedProjet, setSelectedProjet] = useState("");

  const [radarData, setRadarData]   = useState([]); // [{domaine, score}]
  const [tableData, setTableData]   = useState([]); // backend shape

  const [radarViewScope, setRadarViewScope] = useState("me");

  /* ---------------------- HELPERS ------------------------- */
  const params = () => {
    if (role === "COLLABORATEUR") {
      if (radarViewScope === "me") {
        return { user_id: myUserId };
      } else if (radarViewScope === "team" && me.equipe_info) {
        return { equipe_id: me.equipe_info.id }; // si un seul
      }
      return {};
    }

    // Cas TeamLead (ou admin)
    return {
      ...(selectedUser && { user_id: selectedUser }),
      ...(selectedEquipe && { equipe_id: selectedEquipe }),
      ...(selectedProjet && { projet_id: selectedProjet }),
    };
  };
  /* ---------------------- LOAD FILTER LISTS ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const [ppl, eq, prj] = await Promise.all([
          api.get("/personne/personnes/"),
          api.get("/equipes/"),
          api.get("/projet/projets/"),
        ]);
        setUsers(ppl.data);
        setEquipes(eq.data);
        setProjets(prj.data);
      } catch (e) { console.error(e); }
    })();
  }, []);

  /* ---------------------- LOAD DATA ----------------------- */
  useEffect(() => {
    const loadKpiData = async () => {
      setLoading(true);
      try {
        // NOUVEAU: On lance les deux requêtes en parallèle avec Promise.all
        const [radarResponse, tableResponse] = await Promise.all([
          api.get("/quizzes/radar_scores/", { params: params() }),
          api.get("/quizzes/competence_table/", { params: params() }),
        ]);
        
        // On met à jour les deux états avec les nouvelles données
        setRadarData(radarResponse.data);
        setTableData(tableResponse.data);

      } catch (e) {
        console.error("Erreur lors du chargement des données pour les KPIs:", e);
        // En cas d'erreur, on réinitialise les données pour éviter d'afficher des chiffres incorrects
        setRadarData([]);
        setTableData([]);
      }
      setLoading(false);
    };

    loadKpiData();
    // La dépendance à `viewMode` est retirée. Le chargement ne se fait qu'au changement des filtres.
  }, [selectedUser, selectedEquipe, selectedProjet,radarViewScope]);

  useEffect(() => {
  if (role === "COLLABORATEUR" && users.length) {
    if (me && me.equipe_info) {
      /* on garde la 1re équipe comme contexte */
      setSelectedEquipe(me.equipe_info.id);          // id numérique
    }
  }
}, [role, users, myUserId]);

  // --------------------------------------------------------------------------

  const filteredProjets = useMemo(() => {
    // Priorité 1: Un collaborateur est sélectionné
    if (selectedUser) {
      const user = users.find(u => u.matricule === selectedUser);
      if (user && user.projet) {
        return projets.filter(p => p.projet_id === user.projet);
      }
      return []; // Collaborateur sans projet
    }

    // Priorité 2: Une équipe est sélectionnée
    if (selectedEquipe) {
      const team = equipes.find(eq => eq.id === parseInt(selectedEquipe));
      if (team) {
        const userIdsInTeam = new Set(team.assigned_users);
        const projectIds = new Set(users.filter(u => userIdsInTeam.has(u.matricule)).map(u => u.projet));
        return projets.filter(p => projectIds.has(p.projet_id));
      }
    }

    // Défaut: Retourner tous les projets
    return projets;
  }, [selectedUser, selectedEquipe, users, projets, equipes]);

  const filteredEquipes = useMemo(() => {
    // Priorité 1: Un collaborateur est sélectionné
    if (selectedUser) {
        // Trouve toutes les équipes auxquelles l'utilisateur appartient
        return equipes.filter(eq => eq.assigned_users.includes(selectedUser));
    }

    // Priorité 2: Un projet est sélectionné
    if (selectedProjet) {
      const userIdsInProject = new Set(users.filter(u => u.projet === parseInt(selectedProjet)).map(u => u.matricule));
      return equipes.filter(eq => eq.assigned_users.some(userId => userIdsInProject.has(userId)));
    }
    
    // Défaut: Retourner toutes les équipes
    return equipes;
  }, [selectedUser, selectedProjet, users, equipes]);

  const filteredUsers = useMemo(() => {

    
    // Sinon, on filtre en cascade : d'abord par projet, puis par équipe
    let potentialUsers = users;

    if (selectedProjet) {
      potentialUsers = potentialUsers.filter(user => user.projet === parseInt(selectedProjet));
    }

    if (selectedEquipe) {
      const team = equipes.find(eq => eq.id === parseInt(selectedEquipe));
      if (team) {
        const teamUserIds = new Set(team.assigned_users);
        potentialUsers = potentialUsers.filter(user => teamUserIds.has(user.matricule));
      }
    }

    return potentialUsers;
  }, [selectedProjet, selectedEquipe, selectedUser, users, equipes]);


  // Effets pour synchroniser les états et éviter les sélections incohérentes
  useEffect(() => {
    if (selectedProjet && !filteredProjets.some(p => p.projet_id === parseInt(selectedProjet))) {
      setSelectedProjet("");
    }
  }, [selectedProjet, filteredProjets]);

  useEffect(() => {
    if (selectedEquipe && !filteredEquipes.some(e => e.id === parseInt(selectedEquipe))) {
      setSelectedEquipe("");
    }
  }, [selectedEquipe, filteredEquipes]);
  
  useEffect(() => {
    // Cet effet est maintenant crucial. Si on change de projet/équipe, l'utilisateur sélectionné
    // peut devenir invalide, il sera alors réinitialisé.
    if (selectedUser && !filteredUsers.some(u => u.matricule === selectedUser)) {
        setSelectedUser("");
    }
  }, [selectedUser, filteredUsers]);

  // --------------------------------------------------------------------------

  
  /* ---------------------- KPIs ---------------------------- */
  const totalCollab         = tableData.length;
  const competencesCount    = radarData.length;
  const scoreMoyenGlobal    = tableData.length
    ? Math.round(tableData.reduce((sum, user) => sum + user.average, 0) / tableData.length)
    : 0;
  const top3                = [...tableData].sort((a,b)=>b.average-a.average).slice(0,3);

  /* ---------------------- CHART CONFIG -------------------- */
  const radarChart = {
    labels: radarData.map(d => d.domaine),
    datasets: [
      // Couche 1: Le score réalisé (surface pleine)
      {
        label: 'Score Réalisé',
        order: 4,
        data: radarData.map(d => d.score !== null ? (d.score * 4 / 100).toFixed(2) : 0),
        backgroundColor: 'rgba(4, 105, 12, 0.2)', // Bleu (couleur "primary")
        borderColor: 'rgba(128, 171, 0, 1)', 
        borderWidth: 2,
        fill: true, // On remplit la surface pour cette couche
      },
      // Couche 4: Le niveau prérequis (ligne fine rouge)
      {
        label: 'Prérequis',
        order: 3,
        data: radarData.map(d => d.prerequisites),
        backgroundColor: 'rgba(220, 53, 69, 0.2)', // Rouge (couleur "danger")
        borderColor: 'rgb(220, 53, 69)',
        borderWidth: 1,
        pointRadius: 2,
        fill: false,
      },
      // Couche 2: L'objectif pour un collaborateur (ligne pointillée verte)
      {
        label: 'Cible Consultant',
        order: 2,
        data: radarData.map(d => d.consultant_target),
        backgroundColor: 'rgba(25, 135, 84, 0.2)', // Vert (couleur "success")
        borderColor: 'rgb(3, 3, 254)',
        borderWidth: 2,
        borderDash: [5, 5], // Style en pointillé pour les cibles
        fill: false,
      },
      // Couche 3: L'objectif pour un leader (ligne pointillée grise)
      {
        label: 'Cible Leader',
        order: 1,
        data: radarData.map(d => d.leader_target),
        backgroundColor: 'rgba(108, 117, 125, 0.2)', // Gris (couleur "secondary")
        borderColor: 'rgb(1, 176, 240)',
        borderWidth: 2,
        pointRadius: 2,
        fill: false,
      },
      
    ]
  };

  const radarOpts = {
    plugins: {
      // MODIFIÉ : On active la légende, qui est maintenant indispensable
      legend: {
        display: true,
        position: 'top', // Positionne la légende en haut du graphique
      }
    },
    // L'échelle de 0 à 4 est conservée
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 4,
        ticks: { stepSize: 1 }
      }
    },
    maintainAspectRatio: false,
  };

  /* ---------------------- TABLE Maîtrise des compétences -------------------- */
  // On prépare les données pour le tableau
  const renderTablecompetences = () => {
    // Données d'exemple, remplacez par vos vraies données (ex: rows_competences)
    const competenceData = [
      { level: 4, labelEN: 'Expert', labelFR: 'Expert', descEN: 'Can teach and innovate.', descFR: 'Peut former et innover.' },
      { level: 3, labelEN: 'Confirmed', labelFR: 'Confirmé', descEN: 'Works independently.', descFR: 'Travaille sans supervision.' },
      { level: 2, labelEN: 'Junior', labelFR: 'Junior', descEN: 'Requires some guidance.', descFR: 'Nécessite un suivi partiel.' },
      { level: 1, labelEN: 'Beginner', labelFR: 'Débutant', descEN: 'Requires full guidance.', descFR: 'Nécessite un suivi complet.' },
      { level: 'N/A', labelEN: 'Not applicable', labelFR: 'Non applicable', descEN: 'No signature of competence', descFR: 'Aucune signature de compétence' },
    ];

    return (

        <Table bordered responsive hover size="sm" striped className="mb-0 small">
            <thead className="table-light align-middle">
                {/* J'ai simplifié le titre pour qu'il soit plus direct */}
                <tr>
                    <th colSpan={3} className="text-center py-2">
                        <span className="fw-bold">Maîtrise des compétences</span>
                    </th>
                </tr>
                <tr>
                    {/* MODIFIÉ : Suppression des largeurs fixes pour un design responsive */}
                    <th className="text-center" style={{ width: '15%' }}>Niveau</th>
                    <th style={{ width: '35%' }}>Libellé</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody className="align-middle">
                {competenceData.map((r) => (
                    // MODIFIÉ : La classe pour les lignes zébrées est maintenant gérée par la prop `striped`
                    <tr key={r.level}>
                        <td className="text-center">
                                {r.level}

                        </td>
                        <td>
                            <span className="fw-bold">{r.labelFR}</span>
                            <span className="text-muted small d-block">{r.labelEN}</span>
                        </td>
                        <td>
                            {r.descFR}
                            <span className="text-muted small d-block">{r.descEN}</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

  /* ---------------------- RENDER TABLE ROWS --------------- */

  const getProgressBarColor = (score, prerequisites, consultant, leader) => {
    if (score === null) return 'bg-secondary'; // Si pas de score

    // Convertir les cibles (0-4) en pourcentages
    const leaderPct = leader * 25;
    const consultPct = consultant * 25;
    const prereqPct  = prerequisites * 25;

    if (score >= leaderPct) return 'bg-success';     // vert
    if (score >= consultPct) return 'bg-warning';       // bleu
    if (score >= prereqPct)  return 'bg-danger';    // orange
    return 'bg-info';                              // rouge
  };
  const domains = radarData.map(d=>d.domaine);
  const rows = tableData.length ? tableData.map(row=>(
    <tr key={row.user_id}>
      <td>{row.user}</td>
      <td>{row.equipe}</td>
      {domains.map(dom=>{
        const info = row.scores[dom]
        return (
          <td key={dom} className="text-center">
            {info && info.score !== null ? (
              <>
                <div className="progress" style={{height:"6px"}}>
                  <div 
                     className={`progress-bar ${getProgressBarColor(info.score, info.prerequisites, info.consultant_target, info.leader_target
)}`}
                    style={{width: `${info.score}%`}}
                    role="progressbar"
                    aria-valuenow={info.score}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
                <small>{info.score}%</small>
              </>
            ) : (
              <>N/A</>
            )}
          </td>
        );
})}
      <td className="fw-bold text-primary text-center">{row.average}%</td>
    </tr>
  )) : <tr><td colSpan={domains.length + 3} className="text-center py-4 text-muted">
    <div className="text-center p-5 my-4 border-dashed rounded-3">
      <BrainCircuit className="text-primary opacity-25" size={48} />
      <h4 className="mt-3">Matrice de compétences vide</h4>
      <p className="text-muted">Aucune signature de compétence ne correspond aux coordonnées actuelles.</p>
    </div>
    </td></tr>;

  /* ---------------------- JSX ----------------------------- */
  return (
    <div className={styles.dashboard}>
      {/* HEADER */}
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>
            Radar de Compétences
        </h1>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100 p-4 d-flex flex-column justify-content-between">
            <p className="text-muted small mb-1">Collaborateurs évalués</p>
            
              <h3 className="text-primary">
                {totalCollab} / {
                  role === 'TeamLead'
                    ? (selectedUser ? 1 : filteredUsers.length)
                    : (radarViewScope === 'me' ? 1 : filteredUsers.length)
                }
              </h3>
            
            <User className="position-absolute end-0 bottom-0 me-3 mb-3 text-primary opacity-25" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 p-4">
            <p className="text-muted small mb-1">Compétences analysées</p>
            <h3 className="text-success">{competencesCount}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 p-4">
            <p className="text-muted small mb-1">Score moyen global</p>
            <h3 className="text-info">{scoreMoyenGlobal}%</h3>
          </div>
        </div>
      </div>
      {/* FILTERS */}
      { role === "TeamLead" && (
        <>
          <div className="card shadow-sm mb-4 p-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Filtres</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Projet</label>
                  <select className="form-select" value={selectedProjet} onChange={e => setSelectedProjet(e.target.value)}>
                    <option value="">Tous</option>
                    {filteredProjets.map(p=>(<option key={p.projet_id} value={p.projet_id}>{p.nom}</option>))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Équipe</label>
                  <select className="form-select" value={selectedEquipe} onChange={e => setSelectedEquipe(e.target.value)}>
                    <option value="">Toutes</option>
                    {filteredEquipes.map(eq=>(<option key={eq.id} value={eq.id}>{eq.name}</option>))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Collaborateur</label>
                  <select className="form-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                    <option value="">Tous</option>
                    {filteredUsers.map(u=>(<option key={u.matricule} value={u.matricule}>{u.first_name} {u.last_name}</option>))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="btn-group mb-4">
            <button className={`btn ${viewMode==='radar'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setViewMode('radar')}><BarChart3 size={16}/> Vue Radar</button>
            <button className={`btn ${viewMode==='table'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setViewMode('table')}><Table2 size={16}/> Vue Tableau</button>
          </div>
        </>
      )}
      {role === "COLLABORATEUR" && (
        <div className="mb-4 d-flex flex-wrap gap-3">
          <div className="btn-group">
            <button
              className={`btn ${radarViewScope === 'me' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setRadarViewScope("me")}
            >
              Mon radar
            </button>
            <button
              className={`btn ${radarViewScope === 'team' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setRadarViewScope("team")}
            >
              {(() => {
                const me = users.find(u => u.matricule === myUserId);
                return `Mon équipe${me?.equipe_info?.name ? ` : ${me.equipe_info.name}` : ''}`;
              })()}
            </button>
          </div>
        </div>
      )}

        {viewMode === 'radar' ? (
          <>
            <div className="row g-4 mb-4">
                {/* MAIN PANEL */}
                <div className="col">
                    <div className="card shadow-sm p-4">
                    <div className="card-body">
                        <h3 className="card-title mb-3">Radar de compétences</h3>
                        {totalCollab > 0 ? (
                          <>
                            {loading ? (
                              <p>Chargement…</p>
                            ) : (
                              <div className="row g-4 mb-4">
                                <div className="col-lg-4">
                                  {renderTablecompetences()}
                                </div>
                                <div className="col-lg-8">
                                  <div className={styles.chart}>
                                    <Radar data={radarChart} options={radarOpts}/>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center p-5 my-4 border-dashed rounded-3">
                            <BrainCircuit className="text-primary opacity-25" size={48} />
                            <h4 className="mt-3">Matrice de compétences vide</h4>
                            <p className="text-muted">Aucune signature de compétence ne correspond aux coordonnées actuelles.</p>
                          </div>
                        )}
                    </div>
                    </div>
                </div>
            </div>
            <div className="row g-4 mb-4">
                <div className={role === "TeamLead" ? "col-lg-8" : "col-lg-12"}>
                  <div className="card shadow-sm h-100 p-4">
                    <div className="card-body">
                      <h4 className="card-title mb-0">Répartition par compétence</h4>
                      <small>Distribution des scores moyens par domaine</small>

                      {loading ? (
                        <p>Chargement…</p>
                      ) : (
                        <div className="table-responsive mt-4">
                          <table className="table table-sm align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>Domaine</th>
                                <th style={{ width: "25%" }}>Score</th>
                                <th className="text-center">Prérequis</th>
                                <th className="text-center">Consultant</th>
                                <th className="text-center">Leader</th>
                              </tr>
                            </thead>
                            <tbody>
                              {radarData.map((item, idx) => {
                                const score = item.score;
                                return (
                                  <tr key={idx}>
                                    <td><strong>{item.domaine}</strong></td>
                                    <td className="pe-4">
                                      {score !== null ? (
                                        <div className="d-flex align-items-center">
                                          <div className="flex-grow-1">
                                            <div className="progress" style={{ height: '6px' }}>
                                              <div
                                                className={`progress-bar ${getProgressBarColor(score, item.prerequisites, item.consultant_target, item.leader_target)}`}
                                                style={{ width: `${score}%` }}
                                                role="progressbar"
                                                aria-valuenow={score}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                              />
                                            </div>
                                          </div>
                                          <span className="ms-2 text-muted">{score.toFixed(2)}%</span>
                                        </div>
                                      ) : (
                                        <span className="text-muted">N/A</span>
                                      )}
                                    </td>
                                    <td className="bg-danger text-center text-white"><strong>{(item.prerequisites*100/4).toFixed(2)}%</strong></td>
                                    <td className="bg-warning text-center text-white"><strong>{(item.consultant_target*100/4).toFixed(2)}%</strong></td>
                                    <td className="bg-success text-center text-white"><strong>{(item.leader_target*100/4).toFixed(2)}%</strong></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {role === "TeamLead" && (
                  <div className="col-lg-4">
                      <div className="card shadow-sm h-100 p-4">
                          <div className="card-body">
                          <h4 className="card-title mb-3">Top performers</h4>
                          {top3.length===0 && <>N/A</>}
                          {top3.map((p,i)=>(
                              <div key={i} className="d-flex justify-content-between align-items-center bg-light rounded-3 p-3 mb-2">
                              <div>
                                  <strong>{p.user}</strong><br/>
                                  <span className="text-muted small">{p.equipe}</span>
                              </div>
                              <span className="fw-bold text-primary">{p.average}%</span>
                              </div>
                          ))}
                          </div>
                      </div>
                  </div>
                )}
            </div>
          </>
          ) : (role === "TeamLead" && (
            <div className="row g-4">
                {/* MAIN PANEL */}
                <div className="col">
                    <div className="card shadow-sm p-4">
                      <div className="card-body table-responsive">
                          <h5 className="card-title mb-3">Détail des compétences</h5>
                          <table className={`table align-middle small ${styles.competenceTable}`}>
                              <thead className="table-light">
                                  <tr>
                                      <th>Collaborateur</th>
                                      <th>Équipe</th>
                                      {domains.map(d=>(<th key={d} className="text-center">{d}</th>))}
                                      <th className="text-center">Moyenne</th>
                                  </tr>
                              </thead>
                              <tbody>{rows}</tbody>
                          </table>
                      </div>
                  </div>
                </div>
            </div>
        ))}

    </div>
  );
};

export default RadarCompetence;