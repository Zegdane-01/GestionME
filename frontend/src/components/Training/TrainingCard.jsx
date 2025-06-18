import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  User,
  BookOpen,
  FileText,
  Trophy,
  Book,
} from "lucide-react";
import styles from "../../assets/styles/Training/TrainingCard.module.css";

/* ------------------------------------------------------------- */
/*  Mapping statut  → libellé + couleur                          */
/* ------------------------------------------------------------- */
const statusMap = {
  nouvelle: { label: "Nouvelle", className: "bg-secondary" },
  en_cours: { label: "En cours", className: "bg-primary" },
  terminee: { label: "Terminée", className: "bg-success" },
  default: { label: "Inconnue", className: "bg-light text-dark" },
};
const formatDuration = (durationString) => {
  if (!durationString) return null;

  const [hours, minutes] = durationString.split(':').map(Number);
  
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  // Si la durée est 0, on ne retourne rien pour ne pas afficher l'icône.
  if (parts.length === 0) return null;

  return parts.join(' ');
};

/* ------------------------------------------------------------- */
/*  Carte Formation                                              */
/* ------------------------------------------------------------- */
const TrainingCard = ({ training }) => {
  const navigate = useNavigate();

  const { statut, progress = 0 } = training; // progress = 0 par défaut
  const s = statusMap[statut] ?? statusMap.default;

  // Libellé CTA
  const cta =
    statut === "terminee" ? "Revoir" : statut === "nouvelle" ? "Commencer" : "Continuer";

  const chaptersCount = training.modules?.length ?? 0;
  const ressourcesCount = training.ressources?.length ?? 0;

  const formattedDuration = formatDuration(training.total_estimated_time);

  return (
    <div className="card h-100 shadow-sm">
      {/* Visuel de couverture + badge statut */}
      <div className={styles.coverWrapper}>
        {training.image_cover ? (
          <img
            src={training.image_cover}
            alt={training.titre ?? ""}
            className="card-img-top"
            style={{ height: 180, objectFit: "cover" }}
          />
        ) : (
          <div
            className="card-img-top d-flex align-items-center justify-content-center bg-light"
            style={{ height: 180 }}
          >
            <Book size={42} className="text-muted" />
          </div>
        )}
        <span className={`badge position-absolute top-0 end-0 m-2 ${s.className}`}>
          {s.label}
        </span>
      </div>

      {/* Contenu */}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{training.titre}</h5>
        <p className="card-text small text-muted flex-grow-0">
          {training.description || "Aucune description disponible"}
        </p>

        {/* Méta 1 : durée & auteur */}
        <div className="d-flex gap-3 small mb-1">
          {formattedDuration && (
            <span>
              <Clock3 size={14} className="me-1" />
              {formattedDuration}
            </span>
          )}
          {training.created_by && (
            <span>
              <User size={14} className="me-1" />
              {training.created_by_info?.first_name || "__"}{" "}
              {training.created_by_info?.last_name || "__"}
            </span>
          )}
        </div>

        {/* Méta 2 : modules, ressources, quiz */}
        <div className="d-flex gap-3 small align-items-center mb-3">
          <span>
            <BookOpen size={14} className="me-1 text-primary" />
            {chaptersCount} module{chaptersCount > 1 && "s"}
          </span>
          {ressourcesCount > 0 && (
            <span>
              <FileText size={14} className="me-1 text-success" />
              {ressourcesCount} ressource{ressourcesCount > 1 && "s"}
            </span>
          )}
          {training.quiz && <Trophy size={14} className="text-warning" title="Quiz" />}
        </div>

        {/* Progression */}
        {statut !== "nouvelle" && (
          <>
            <p className="small mb-1">
              Progression <span className="float-end">{progress}%</span>
            </p>
            <div className="progress mb-3" style={{ height: 4 }}>
              <div
                className={`progress-bar ${statut === "terminee" ? "bg-success" : "bg-dark"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {/* CTA */}
        <button
          className="btn btn-dark w-100 mt-auto"
          onClick={() => navigate(`/trainings/${training.id}`)}
        >
          {cta}
        </button>
      </div>
    </div>
  );
};

export default TrainingCard;
