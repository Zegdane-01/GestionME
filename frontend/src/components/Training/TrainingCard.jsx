import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  User,
  Calendar,
  BookOpen,
  FileText,
  Trophy,
  Book,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/api";
import styles from "../../assets/styles/Training/TrainingCard.module.css";
import ConfirmationModal from './ConfirmationModal';

/* ------------------------------------------------------------- */
/*  Mapping status  → libellé + couleur                          */
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
const TrainingCard = ({ training, onUpdate }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const { status, progress = 0, userFormationId } = training; // progress = 0 par défaut
  const s = statusMap[status] ?? statusMap.default;

  // Libellé CTA
  const cta =
    status === "terminee" ? "Revoir" : status === "nouvelle" ? "Commencer" : "Continuer";

  const handleRestart = (e) => {
    e.stopPropagation();
    setShowConfirmModal(true);
  };
  const executeRestart = async () => {
    // On ferme la modale d'abord
    setShowConfirmModal(false);

    if (!userFormationId) {
      toast.error("Impossible de réinitialiser : ID de suivi manquant.");
      return;
    }

    setIsRestarting(true);
    try {
      const response = await api.post(`/user-formations/${userFormationId}/restart/`);
      toast.success("La formation a été réinitialisée !");
      onUpdate(); 
    } catch (err) {
      toast.error("Une erreur est survenue.");
    } finally {
      setIsRestarting(false);
    }
  };


  const formattedDuration = formatDuration(training.total_estimated_time);

  return (
    <div className="card h-100 shadow-sm">
      {/* Visuel de couverture + badge status */}
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

        {/* Méta 1 : durée, formateur et deadline */}
        <div className="d-flex flex-wrap gap-3 small mb-2">
          {formattedDuration && (
            <span>
              <Clock3 size={14} className="me-1" />
              {formattedDuration}
            </span>
          )}
          {training.formateur && (
            <span>
              <User size={14} className="me-1 text-info" />
              Formateur : <strong>{training.formateur}</strong>
            </span>
          )}
          {training.deadline && (
            <span
              style={{
                backgroundColor: new Date(training.deadline) < new Date() ? '#ffdddd' : '#eef6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Calendar size={14} className="me-1 text-danger" />
              Limite : {new Date(training.deadline).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>

        {/* Méta 2 : modules, ressources, quiz */}
        <div className="d-flex flex-wrap gap-2 small align-items-center mb-3">
          <span className="badge bg-primary d-flex align-items-center">
            <BookOpen size={14} className="me-1" />
            <strong>{training.module_count}</strong> &nbsp;module{training.module_count > 1 ? 's' : ''}
          </span>

          <span className="badge bg-primary d-flex align-items-center">
            <FileText size={14} className="me-1" />
            <strong>{training.resource_count}</strong> &nbsp;ressource{training.resource_count > 1 ? 's' : ''}
          </span>

          <span className={`badge ${training.has_quiz ? "bg-success" : "bg-secondary"}`}>
            {training.has_quiz ? "✔ Quiz présent" : "✖ Aucun quiz"}
          </span>
        </div>


        {/* Progression */}
        {status !== "nouvelle" && (
          <>
            <p className="small mb-1">
              Progression <span className="float-end">{progress}%</span>
            </p>
            <div className="progress mb-3" style={{ height: 4 }}>
              <div
                className={`progress-bar ${status === "terminee" ? "bg-success" : "bg-dark"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        <div className="mt-auto">
          {status === 'terminee' ? (
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <button
                className="btn btn-dark flex-grow-1"
                onClick={() => navigate(`/trainings/${training.id}`)}
              >
                {cta}
              </button>
              <button
                className="btn btn-outline-warning d-flex align-items-center justify-content-center"
                onClick={handleRestart}
                disabled={isRestarting}
                title="Recommencer la formation"
              >
                {isRestarting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                  <RefreshCw size={16} /> &nbsp;Recommencer
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-dark w-100"
              onClick={() => navigate(`/trainings/${training.id}`)}
            >
              {cta}
            </button>
          )}
          </div>
      </div>
      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={executeRestart}
      />
    </div>
  );
};

export default TrainingCard;
