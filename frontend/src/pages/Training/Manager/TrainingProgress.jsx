// src/pages/Training/Manager/FormationProgressPage.jsx
// ------------------------------------------------------
// Remplacé l'ancien composant par une version complète :
// • Icônes Lucide (check / clock / wrong)
// • Filtre Équipe ➜ charge collaborateurs dyn.  
// • Gestion du cas « collaborateur n’a jamais commencé »
// • Axios centralisé (api)
// • CSS Modules (styles)

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  XCircle,
  Play,
  ChevronLeft,
  Users,
  User,
  ListChecks,
  Award,    
} from "lucide-react";
import toast from "react-hot-toast";

import styles from "../../../assets/styles/Training/TrainingProgress.module.css";
import api from "../../../api/api";

/** ----------------------------------------------------------------
 *  Utilitaires
 * ----------------------------------------------------------------*/
const Icon = ({ name, className = "" }) => {
  switch (name) {
    case "check":
      return <CheckCircle size={16} className={className} />;
    case "clock":
      return <Clock size={16} className={className} />;
    case "wrong":
      return <XCircle size={16} className={className} />;
    default:
      return null;
  }
};

/** ----------------------------------------------------------------
 *  Sous‑composants
 * ----------------------------------------------------------------*/
const StatCard = ({ title, value, subtitle, progress }) => (
  <div className={styles.card}>
    <span className={styles.cardTitle}>{title}</span>
    <span className={styles.cardValueLarge}>{value}</span>
    {subtitle && <span className={styles.cardSubtitle}>{subtitle}</span>}
    {typeof progress === "number" && (
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

const ProgressHeader = ({ data }) => {
    const totalTabs = Object.keys(data.tabsCompleted).length;
    const completedTabs = Object.values(data.tabsCompleted).filter(
        (isCompleted) => isCompleted === true
    ).length;
    return (
        <div className={styles.progressCards}>
            <StatCard
            title="Progression générale"
            value={`${data.progression_generale}%`}
            progress={data.progression_generale}
            />
            <StatCard
            title="Chapitres terminés"
            value={`${completedTabs}/${totalTabs}`}
            subtitle="chapitres"
            />
            <StatCard
            title="Temps passé"
            value={data.temps_passe_minutes}
            subtitle="minutes"
            />
            <StatCard title="Dernier accès" value={data.dernier_acces || "—"} />
        </div>
    )};

const ChapterList = ({ chapters, has_chapters }) => {
    if (!has_chapters) {
    return (
        <div className={styles.quizSection}>
            <h2>
                <ListChecks size={22} className={styles.titleIcon} />
                &nbsp;Progression par chapitre
            </h2>
            <div className={styles.noQuizMessage}>
            <p>Aucun chapitre n'est associé à cette formation.</p>
            </div>
        </div>
        );
    }
    else{
        return (
        <div className={styles.chapterSection}>
            <h2>
            <ListChecks size={22} className={styles.titleIcon} />
            &nbsp;Progression par chapitre
            </h2>
            <ul className={styles.chapterList}>
            {chapters.map((c, i) => (
                <li key={c.id} className={styles.chapterItem}>
                <div className={styles.chapterInfo}>
                    <div className={`${styles.chapterNumber} ${c.status === "Terminé" ? styles.completed : ""}`}>
                        <span className={styles.chapterNumberValue}>
                            {i + 1}
                        </span>
                    
                    </div>
                    <div>
                    <p className={styles.chapterTitle}>{c.titre}</p>
                    {c.description && (
                        <p className={styles.chapterDescription}>{c.description}</p>
                    )}
                    </div>
                </div>
                <div className={styles.chapterStatus}>
                    <Icon name="clock" /> {c.estimated_time_min} min
                    <span className={`${styles.statusBadge} ${c.status === "Terminé" ? styles.statusCompleted : styles.statusTodo}`}>
                    {c.status === "Terminé" ? (
                        <>
                        <Icon name="check" /> Terminé
                        </>
                    ) : (
                        "À faire"
                    )}
                    </span>
                </div>
                </li>
            ))}
            </ul>
        </div>
    )}

};


const QuizResults = ({ quiz, has_quiz }) => {
  if (!has_quiz) {
    return (
      <div className={styles.quizSection}>
        <h2>
          <Award size={22} className={styles.titleIcon} />
          Résultats du Quiz
        </h2>
        <div className={styles.noQuizMessage}>
          <p>Aucun quiz n'est associé à cette formation.</p>
        </div>
      </div>
    );
  }
  if (quiz) {
    return (
        <div className={styles.quizSection}>
        <h2>
            {/* On remplace l'emoji par une icône Lucide */}
            <Award size={22} className={styles.titleIcon} />
            Résultats du Quiz
        </h2>
        <div className={styles.quizSummaryCard}>
            <div>
            <p className={styles.finalScoreTitle}>Score final</p>
            <p className={styles.quizTime}>Temps: {quiz.temps_passe_minutes} min</p>
            </div>
            <div className={styles.scoreDisplay}>
            <p className={styles.scoreValue}>
                {quiz.score_final.score/quiz.score_final.total * 100}%
            </p>

            </div>
        </div>
        <h3>Détail des réponses</h3>
        <div className={styles.answersList}>
            {quiz.detail_des_reponses.map((ans, idx) => {
            const corr = ans.points_awarded > 0;
            const userResp = Array.isArray(ans.user_response)
                ? ans.user_response.join(", ")
                : ans.user_response;
            const corrResp = Array.isArray(ans.correct_response)
                ? ans.correct_response.join(", ")
                : ans.correct_response;
            return (
                <div key={ans.id} className={styles.answerItem}>
                <div className={styles.answerHeader}>
                    <p>
                    Q{idx + 1}: {ans.texte}
                    </p>
                    <span className={styles.points}>
                    <Icon name={corr ? "check" : "wrong"} /> {ans.points_awarded} pts
                    </span>
                </div>
                <p className={styles.yourResponse}>La réponse: {userResp || "—"}</p>
                {!corr && (
                    <p className={styles.correctResponse}>Bonne réponse: {corrResp}</p>
                )}
                </div>
            );
            })}
        </div>
        </div>
    );
  }
  else {
    return (
      <div className={styles.quizSection}>
        <h2>
          <Award size={22} className={styles.titleIcon} />
          Résultats du Quiz
        </h2>
        <div className={styles.noQuizMessage}>
          <p>Ce collaborateur n’a pas encore passé le quiz.</p>
        </div>
      </div>
    );
  }
};

const CollaboratorInfoCard = ({ collaborator }) => {
  if (!collaborator) return null;

  return (
    <div className={styles.collaboratorCard}>
      {/* Vous pouvez remplacer ceci par une vraie image si vous l'avez */}
      <div className={styles.avatarPlaceholder}>
        {collaborator.full_name.charAt(0)}
      </div>
      <div className={styles.collaboratorDetails}>
        <span className={styles.collaboratorName}>{collaborator.full_name}</span>
        {/* L'email et le rôle peuvent être ajoutés à l'API si nécessaire */}
        <span className={styles.collaboratorEmail}>
          {collaborator.mail || "__"}
        </span>
        <div>
          <span className={styles.collaboratorRole}>COLLABORATEUR</span>
        </div>
      </div>
    </div>
  );
};


/** ----------------------------------------------------------------
 *  Composant principal
 * ----------------------------------------------------------------*/
const FormationProgressPage = () => {
  const { formationId } = useParams();

  // core data
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filters data
  const [teams, setTeams] = useState([]);
  const [collabs, setCollabs] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [teamId, setTeamId] = useState("");
  const [collabId, setCollabId] = useState("");

  /** Fetch select options */
  useEffect(() => {
    if (!formationId) return;
    (async () => {
      setFiltersLoading(true);
      try {
        const { data } = await api.get(`/formations/${formationId}/filter-options/`);
        setTeams(data.equipes);
        setCollabs(data.collaborateurs);
      } catch (e) {
        toast.error("Impossible de charger les filtres");
      } finally {
        setFiltersLoading(false);
      }
    })();
  }, [formationId]);

  /** Filtered collabs for current team */
  const collabsForTeam = useMemo(() => {
    if (!teamId) return [];
    return collabs.filter((c) => c.equipe_id === Number(teamId));
  }, [teamId, collabs]);

  /** Fetch progress each time filters change */
  useEffect(() => {
    if (!formationId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/formations/${formationId}/progress/`, {
          params: {
            ...(teamId && { equipe_id: teamId }),
            ...(collabId && { collaborateur_id: collabId }),
          },
        });
        // Backend peut renvoyer [] si collab n’a jamais commencé.
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setProgress(null);
        } else {
          setProgress(Array.isArray(data) ? data[0] : data);
        }
      } catch (e) {
        if (e.response?.status === 404) {
          // cas « jamais commencé »
          setProgress(null);
        } else {
          setError(e.message || "Erreur inconnue");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId, teamId, collabId]);

  useEffect(() => {
    if (!filtersLoading && teams.length > 0 && !teamId) {
        setTeamId(teams[0].id);          // ⬅️  sélection par défaut
        onTeamChange({ target: { value: teams[0].id } }); 
    }
    }, [filtersLoading, teams, teamId]);

  /** Handlers */
  const onTeamChange = (e) => {
    const id = e.target.value;
    setTeamId(id);
    // auto‑select first collab if exists, else clear
    if (id) {
      const first = collabs.find((c) => c.equipe_id === Number(id));
      setCollabId(first ? first.matricule : "");
    } else {
      setCollabId("");
    }
  };

  const selectedCollaboratorObject = useMemo(() => {
    if (!collabId) return null;
    return collabs.find((c) => c.matricule === collabId);
  }, [collabId, collabs]);

  /** Render */
  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className={styles.dashboard}>
       <div className={styles.pageHeader}>
    
            <div className={styles.headerTop}>
            <button className={styles.backLink} onClick={() => window.history.back()}>
                <ChevronLeft size={18} /> Retour
            </button>
            {progress && (
                <span className={styles.statusPill}>
                {progress.statut_formation}
                </span>
            )}
            </div>

            <div className={styles.dashboardHeader}>
                <div className={styles.dashboardTitle}>
                    <h1>Progression - {progress?.titre || "..."}</h1>
                </div>
            </div>
        </div>
           <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                <Users size={20} /> Sélectionner une équipe
                </label>
                <select
                className={styles.filterSelect}
                value={teamId}
                onChange={onTeamChange}
                disabled={filtersLoading}
                >
                {filtersLoading ? (
                    <option>Chargement…</option>
                ) : (
                    <>
                    {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                        {t.name}
                        </option>
                    ))}
                    </>
                )}
                </select>
            </div>
            {teamId && (
                <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                    <User size={20} /> Sélectionner un collaborateur
                </label>
                <select
                    className={styles.filterSelect}
                    value={collabId}
                    onChange={(e) => setCollabId(e.target.value)}
                    disabled={!teamId}
                >
                    {collabsForTeam.map((c) => (
                    <option key={c.matricule} value={c.matricule}>
                        {c.full_name}
                    </option>
                    ))}
                </select>
                {loading ? (
                    <p>Chargement des données du collaborateur...</p>
                ) : (
                    <CollaboratorInfoCard collaborator={selectedCollaboratorObject} />
                )}
                </div>
            )}

      {/* Cas no‑progress */}
      {progress.progression_generale ===0 ? (
        <div className={styles.noProgress}>Ce collaborateur n’a pas encore commencé cette formation.</div>
      ) : (
        <>
          <ProgressHeader data={progress} />
          <ChapterList chapters={progress.progression_par_chapitre} has_chapters={progress.has_chapters}/>
          <QuizResults quiz={progress.resultats_du_quiz} has_quiz={progress.has_quiz}/>
        </>
      )}
    </div>
  );
};

export default FormationProgressPage;
