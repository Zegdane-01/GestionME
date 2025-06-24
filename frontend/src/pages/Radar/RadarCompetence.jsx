import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import { User, BarChart3, Table2, BrainCircuit, Minus } from "lucide-react";
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
import { Radar, Bar } from "react-chartjs-2";

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

  const [selectedUser, setSelectedUser]     = useState("");
  const [selectedEquipe, setSelectedEquipe] = useState("");
  const [selectedProjet, setSelectedProjet] = useState("");

  const [radarData, setRadarData]   = useState([]); // [{domaine, score}]
  const [tableData, setTableData]   = useState([]); // backend shape

  /* ---------------------- HELPERS ------------------------- */
  const params = () => ({
    ...(selectedUser   && { user_id   : selectedUser   }),
    ...(selectedEquipe && { equipe_id : selectedEquipe }),
    ...(selectedProjet && { projet_id : selectedProjet }),
  });

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
  }, [selectedUser, selectedEquipe, selectedProjet]);

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
    labels  : radarData.map(d=>d.domaine),
    datasets: [{
      label : selectedUser || "Score",
      data  : radarData.map(d=>d.score*4/100),
      backgroundColor: "rgba(13,110,253,.2)",
      borderColor    : "#0d6efd",
      borderWidth    : 2,
    }],
  };
  const radarOpts = {
    plugins: { legend:{ display:false } },
    scales : { r:{ suggestedMin:0, suggestedMax:4, ticks:{ stepSize:1 } } },
    maintainAspectRatio:false,
  };

  /* ---------------------- RENDER TABLE ROWS --------------- */

  const getProgressBarColor = (score) => {
    if (score >= 75) return 'bg-success'; // Vert pour les excellents scores
    if (score >= 50) return 'bg-info';    // Bleu pour les scores corrects
    if (score >= 25) return 'bg-warning'; // Orange pour les scores faibles
    return 'bg-danger';                  // Rouge pour les scores très faibles
  };
  const domains = radarData.map(d=>d.domaine);
  const rows = tableData.length ? tableData.map(row=>(
    <tr key={row.user_id}>
      <td>{row.user}</td>
      <td>{row.equipe}</td>
      {domains.map(dom=>{
        const score = row.scores[dom];
        return (
          <td key={dom} className="text-center">
            {score !== null ? (
              <>
                <div className="progress" style={{height:"6px"}}>
                  <div 
                    className={`progress-bar ${getProgressBarColor(score)}`} 
                    style={{width: `${score}%`}}
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
                <small>{score}%</small>
              </>
            ) : (
              <Minus className="text-muted" size={20} strokeWidth={2.5} />
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
          <div className="card shadow-sm h-100 p-3 d-flex flex-column justify-content-between">
            <p className="text-muted small mb-1">Collaborateurs évalués</p>
            {!selectedUser ?
              <h3 className="text-primary">{totalCollab} / {filteredUsers.length}</h3>
             : 
              <h3 className="text-primary">{totalCollab} / 1</h3>
            }
            <User className="position-absolute end-0 bottom-0 me-3 mb-3 text-primary opacity-25" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 p-3">
            <p className="text-muted small mb-1">Compétences analysées</p>
            <h3 className="text-success">{competencesCount}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 p-3">
            <p className="text-muted small mb-1">Score moyen global</p>
            <h3 className="text-info">{scoreMoyenGlobal}%</h3>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card shadow-sm mb-4">
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

      {/* TOGGLE */}
      <div className="btn-group mb-4">
        <button className={`btn ${viewMode==='radar'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setViewMode('radar')}><BarChart3 size={16}/> Vue Radar</button>
        <button className={`btn ${viewMode==='table'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setViewMode('table')}><Table2 size={16}/> Vue Tableau</button>
      </div>
        {viewMode === 'radar' ? (
          <>
            <div className="row g-4 mb-4">
                {/* MAIN PANEL */}
                <div className="col">
                    <div className="card shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title mb-3">Radar de compétences</h3>
                        {totalCollab > 0 ? (
                          <>
                            {loading ? <p>Chargement…</p> : <div className={styles.chart}><Radar data={radarChart} options={radarOpts}/></div>}
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
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h4 className="card-title mb-0">Répartition par compétence</h4>
                            <small>Distribution des scores moyens par domaine</small>
                            {loading? <p>Chargement…</p> : (
                              <div className="d-grid gap-2 mt-4 ">
                                {radarData.map((item, idx)=> {
                                  const score = item.score;
                                  return (
                                    <div key={idx} className="row align-items-center mb-2"> 
                                        <div className="col-lg-4">
                                            <span className="fw-medium">{item.domaine}</span>
                                        </div>
                                        {/* La structure de la colonne de droite a été simplifiée */}
                                        <div className="col-lg-8">
                                            {score !== null ? (
                                                // NOUVELLE STRUCTURE : Un simple conteneur flex pour aligner la barre et le score
                                                <div className="d-flex align-items-center">
                                                    <div className="flex-grow-1">
                                                        <div className="progress" style={{height:'6px'}}>
                                                            <div 
                                                                className={`progress-bar ${getProgressBarColor(score)}`} 
                                                                style={{width: `${score}%`}}
                                                                role="progressbar"
                                                                aria-valuenow={score}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="ms-3" style={{ minWidth: '40px' }}> {/* Espace et largeur minimale pour le texte */}
                                                        <span className="text-muted fw-semibold">{score}%</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                // L'icône sera maintenant bien centrée grâce à "align-items-center" sur la ligne parente
                                                <Minus className="text-muted" size={20} strokeWidth={2.5} />
                                            )}
                                        </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                        <h4 className="card-title mb-3">Top performers</h4>
                        {top3.length===0 && <Minus className="text-muted" size={20} strokeWidth={2.5} />}
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
            </div>
          </>
          ) : (
            <div className="row g-4">
                {/* MAIN PANEL */}
                <div className="col">
                    <div className="card shadow-sm">
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
        )}

    </div>
  );
};

export default RadarCompetence;