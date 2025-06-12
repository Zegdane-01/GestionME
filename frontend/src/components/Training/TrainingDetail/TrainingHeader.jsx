import {
  Clock3,
  Play,
  FileText,
  Trophy,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../Shared/ProgressBar";
import styles from "../../../assets/styles/Training/TrainingDetail/TrainingHeader.module.css";

/* ------------------------------------------------------------- */
/*      Mapping statut (nouveau modèle)                          */
/* ------------------------------------------------------------- */
const statusMap = {
  nouvelle: { label: "Nouvelle", cls: "bg-secondary" },
  en_cours: { label: "En cours", cls: "bg-primary" },
  terminee: { label: "Terminée", cls: "bg-success" },
};

/* ------------------------------------------------------------- */
/*      Header                                                   */
/* ------------------------------------------------------------- */
const TrainingHeader = ({ training = {} }) => {
  // Sécurité : valeurs par défaut
  const {
    statut = "nouvelle",
    titre = "",
    duree = 0, // en minutes
    chapters = [],
    resources = [],
    quiz = null,
    progress = 0,
  } = training;

  const s = statusMap[statut] ?? statusMap.nouvelle;
  const navigate = useNavigate();

  // Conversion durée en h / min
  const hours = Math.floor(duree / 60);
  const minutes = duree % 60;

  return (
    <section className={`card p-4 mb-4 position-relative ${styles.header}`}>
      {/* Ligne 1 : retour + titre */}
      <div className="d-flex align-items-center mb-3">
        <button
          onClick={() => navigate(-1)}
          className={styles.backBtn}
          title="Retour"
        >
          <ChevronLeft size={22} />
        </button>
        <h2 className="mb-0">{titre}</h2>
      </div>

      {/* Badge statut */}
      <span className={`badge ${s.cls} position-absolute top-0 end-0 m-3`}>
        {s.label}
      </span>

      {/* Méta + pourcentage */}
      <div className="d-flex gap-4 small mb-1 flex-wrap">
        {duree > 0 && (
          <span>
            <Clock3 size={14} className="me-1" /> {hours} h {minutes} min
          </span>
        )}
        <span>
          <Play size={14} className="me-1" /> {chapters.length} chapitre
          {chapters.length > 1 && "s"}
        </span>
        {resources.length > 0 && (
          <span>
            <FileText size={14} className="me-1" /> {resources.length} ressource
            {resources.length > 1 && "s"}
          </span>
        )}
        {quiz && (
          <span>
            <Trophy size={14} className="me-1 text-warning" /> Quiz final
          </span>
        )}
        <span className="ms-auto">{progress}%</span>
      </div>

      {/* Barre de progression */}
      <ProgressBar value={progress} success={statut === "terminee"} />
    </section>
  );
};

export default TrainingHeader;
