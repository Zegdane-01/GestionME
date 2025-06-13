import { useMemo } from "react"; // Importez useMemo pour le calcul
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

const statusMap = {
  nouvelle: { label: "Nouvelle", cls: "bg-secondary" },
  en_cours: { label: "En cours", cls: "bg-primary" },
  terminee: { label: "Terminée", cls: "bg-success" },
};

/**
 * Helper pour convertir une durée "HH:MM:SS" en minutes totales.
 */
const parseDurationToMinutes = (durationString) => {
  if (!durationString || typeof durationString !== 'string') {
    return 0;
  }
  const parts = durationString.split(':').map(Number);
  if (parts.length !== 3) return 0;
  const [hours, minutes, seconds] = parts;
  return (hours * 60) + minutes + (seconds / 60);
};


const TrainingHeader = ({ training = {} }) => {
  // --- CHANGEMENT 1 : Adapter la déstructuration aux données de l'API ---
  // On utilise 'modules' et 'ressources' et on supprime 'duree' qui n'existe pas.
  const {
    statut = "nouvelle",
    titre = "",
    modules = [],      // C'était 'chapters'
    ressources = [],   // C'était 'resources'
    quiz = null,
    progress = 0,
  } = training;

  const s = statusMap[statut] ?? statusMap.nouvelle;
  const navigate = useNavigate();

  // --- CHANGEMENT 2 : Calculer la durée totale à partir des modules ---
  // On utilise useMemo pour ne recalculer que si les modules changent.
  const totalDurationInMinutes = useMemo(() => {
    return modules.reduce((total, module) => {
      // Le 'estimated_time' vient de l'API (ex: "00:15:00")
      return total + parseDurationToMinutes(module.estimated_time);
    }, 0);
  }, [modules]);

  // Conversion de la durée totale calculée en h / min
  const totalMinutes = Math.round(totalDurationInMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

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

      {/* --- CHANGEMENT 3 : Afficher les données corrigées --- */}
      <div className="d-flex gap-4 small mb-1 flex-wrap">
        {/* On affiche la durée seulement si elle est supérieure à 0 */}
        {totalMinutes > 0 && (
          <span>
            <Clock3 size={14} className="me-1" /> {hours > 0 && `${hours}h `}{minutes > 0 && `${minutes}min`}
          </span>
        )}
        <span>
          {/* On utilise 'modules.length' */}
          <Play size={14} className="me-1" /> {modules.length} module
          {modules.length > 1 && "s"}
        </span>
        {ressources.length > 0 && (
          <span>
            {/* On utilise 'ressources.length' */}
            <FileText size={14} className="me-1" /> {ressources.length} ressource
            {ressources.length > 1 && "s"}
          </span>
        )}
        {quiz && (
          <span>
            <Trophy size={14} className="me-1 text-warning" /> Quiz final
          </span>
        )}
        <span className="ms-auto fw-bold">{progress}%</span>
      </div>

      {/* Barre de progression */}
      <ProgressBar value={progress} success={statut === "terminee"} />
    </section>
  );
};

export default TrainingHeader;