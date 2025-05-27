import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock3,
  User,
  BookOpen,
  FileText,
  Trophy
} from 'lucide-react';
import styles from '../../assets/styles/Training/TrainingCard.module.css';

const statusMap = {
  new:   { label: 'Nouvelle',   class: 'bg-secondary' },
  in_progress: { label: 'En cours',  class: 'bg-primary' },
  completed:   { label: 'Terminée',  class: 'bg-success' }
};

const TrainingCard = ({ training }) => {
  const navigate = useNavigate();
  const s = statusMap[training.status];

  // libellé CTA
  const cta =
    training.status === 'completed'
      ? 'Revoir'
      : training.status === 'new'
      ? 'Commencer'
      : 'Continuer';

  const showProgress = training.status !== 'new';

  return (
    <div className="card h-100 shadow-sm">
      {/* ─── cover + badge ───────────────────────────────────────────────────── */}
      <div className={styles.coverWrapper}>
        <img src={training.cover} alt="" className="card-img-top" />
        <span className={`badge position-absolute top-0 end-0 m-2 ${s.class}`}>
          {s.label}
        </span>
      </div>

      {/* ─── content ────────────────────────────────────────────────────────── */}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{training.title}</h5>
        <p className="card-text small text-muted flex-grow-0">{training.intro}</p>

        {/* Meta ligne 1 */}
        <div className="d-flex gap-3 small mb-1">
          <span><Clock3 size={14} className="me-1" />{Math.floor(training.duration/60)} h {training.duration%60} min</span>
          <span><User size={14} className="me-1" />{training.createdBy}</span>
        </div>

        {/* Meta ligne 2 */}
        <div className="d-flex gap-3 small align-items-center mb-3">
          <span><BookOpen size={14} className="me-1 text-primary" />{training.chapters.length} chapitres</span>
          {training.resources.length > 0 &&
            <span><FileText size={14} className="me-1 text-success" />{training.resources.length} ressources</span>}
          {training.quiz && <Trophy size={14} className="text-warning" title="Quiz" />}
        </div>

        {/* Progression */}
        {showProgress && (
          <>
            <p className="small mb-1">
              Progression
              <span className="float-end">{training.progress}%</span>
            </p>
            <div className="progress mb-3" style={{ height: 4 }}>
              <div
                className={`progress-bar ${
                  training.status === 'completed' ? 'bg-success' : 'bg-dark'
                }`}
                style={{ width: `${training.progress}%` }}
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
