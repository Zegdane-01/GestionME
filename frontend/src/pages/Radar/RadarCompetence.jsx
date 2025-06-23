import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { User, Users, BarChart3, Table2 } from "lucide-react";
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
    const load = async () => {
      setLoading(true);
      try {
        if (viewMode === "radar") {
          const r = await api.get("/quizzes/radar_scores/", { params: params() });
          setRadarData(r.data);
        } else {
          const t = await api.get("/quizzes/competence_table/", { params: params() });
          setTableData(t.data);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [viewMode, selectedUser, selectedEquipe, selectedProjet]);

  /* ---------------------- KPIs ---------------------------- */
  const totalCollab         = tableData.length || users.length || 0;
  const competencesCount    = radarData.length;
  const scoreMoyenGlobal    = radarData.length ? Math.round(radarData.reduce((a,b)=>a+b.score,0)/radarData.length) : 0;
  const top3                = [...tableData].sort((a,b)=>b.average-a.average).slice(0,3);

  /* ---------------------- CHART CONFIG -------------------- */
  const radarChart = {
    labels  : radarData.map(d=>d.domaine),
    datasets: [{
      label : selectedUser || "Score",
      data  : radarData.map(d=>d.score),
      backgroundColor: "rgba(13,110,253,.2)",
      borderColor    : "#0d6efd",
      borderWidth    : 2,
    }],
  };
  const radarOpts = {
    plugins: { legend:{ display:false } },
    scales : { r:{ suggestedMin:0, suggestedMax:100, ticks:{ stepSize:20 } } },
    maintainAspectRatio:false,
  };
  const barChart = {
    labels  : radarData.map(d=>d.domaine),
    datasets: [{ label:"Score", data: radarData.map(d=>d.score), backgroundColor:"#0d6efd" }],
  };
  const barOpts = { indexAxis:"y", plugins:{legend:{display:false}}, scales:{ x:{ max:100, ticks:{ callback:v=>v+"%" }}} };

  /* ---------------------- RENDER TABLE ROWS --------------- */
  const domains = radarData.map(d=>d.domaine);
  const rows = tableData.length ? tableData.map(row=>(
    <tr key={row.user_id}>
      <td>{row.user}</td>
      <td>{row.equipe}</td>
      {domains.map(dom=>(
        <td key={dom} className="text-center">
          <div className="progress" style={{height:"6px"}}>
            <div className="progress-bar" style={{width:`${row.scores[dom]||0}%`}} />
          </div>
          <small>{row.scores[dom]||0}%</small>
        </td>
      ))}
      <td className="fw-bold text-primary text-center">{row.average}%</td>
    </tr>
  )) : <tr><td colSpan={domains.length+3} className="text-center py-3">Aucune donnée</td></tr>;

  /* ---------------------- JSX ----------------------------- */
  return (
    <div className={styles.dashboard}>
      {/* HEADER */}
      <div className="mb-4">
        <h1 className={styles.dashboardTitle}>
            Radar de Compétences
        </h1>
        <p className="text-muted fs-5 mb-3">Le radar des compétences business liées aux TI</p>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100 p-3 d-flex flex-column justify-content-between">
            <p className="text-muted small mb-1">Collaborateurs évalués</p>
            <h3 className="text-primary">{totalCollab}</h3>
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
              <label className="form-label">Collaborateur</label>
              <select className="form-select" value={selectedUser} onChange={e=>setSelectedUser(e.target.value)}>
                <option value="">Tous</option>
                {users.map(u=>(<option key={u.matricule} value={u.matricule}>{u.first_name} {u.last_name}</option>))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Équipe</label>
              <select className="form-select" value={selectedEquipe} onChange={e=>setSelectedEquipe(e.target.value)}>
                <option value="">Toutes</option>
                {equipes.map(eq=>(<option key={eq.id} value={eq.id}>{eq.name}</option>))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Projet</label>
              <select className="form-select" value={selectedProjet} onChange={e=>setSelectedProjet(e.target.value)}>
                <option value="">Tous</option>
                {projets.map(p=>(<option key={p.id} value={p.id}>{p.nom}</option>))}
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
        {viewMode==='radar'? (
            <>
                <div className="row g-4 mb-4">
                    {/* MAIN PANEL */}
                    <div className="col">
                        <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="card-title mb-3">Radar de compétences</h3>
                            {loading ? <p>Chargement…</p> : <div className={styles.chart}><Radar data={radarChart} options={radarOpts}/></div>}
                        </div>
                        </div>
                    </div>
                </div>
                <div className="row g-4 mb-4">
                    <div className="col-lg-8">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h4 className="card-title mb-0">Répartition par compétence</h4>
                                <small>Distribution des scores moyens par domaine</small>
                                {loading? <p>Chargement…</p> : (
                                    <div className="d-grid gap-2 mt-4 ">
                                    {radarData.map(item=> (
                                        <div className="row">
                                            <div className="col-lg-4 ">
                                                <div key={item.domaine} className="d-flex align-items-center justify-content-between">
                                                    <span className="fw-medium">{item.domaine}</span>
                                                </div>
                                            </div>
                                            <div className="col-lg-8 ">
                                                <div className="row d-flex align-items-center justify-content-between">
                                                    <div className="col-lg-10 ">
                                                        <div className="flex-grow-1 mx-3">
                                                            <div className="progress" style={{height:'6px'}}>
                                                            <div className="progress-bar bg-primary" style={{width:`${item.score}%`}}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-2 ">
                                                        <span className="text-muted fw-semibold">{item.score}%</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                            <h4 className="card-title mb-3">Top performers</h4>
                            {top3.length===0 && <p className="text-muted small">Pas encore de données.</p>}
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
          ): (
            <div className="row g-4">
                {/* MAIN PANEL */}
                <div className="col">
                    <div className="card shadow-sm">
                        <div className="card-body table-responsive">
                            <h5 className="card-title mb-3">Détail des compétences</h5>
                            <table className="table align-middle small">
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