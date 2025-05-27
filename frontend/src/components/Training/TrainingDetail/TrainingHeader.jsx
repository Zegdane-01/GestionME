// components/training/TrainingHeader.jsx
import {
  Clock3, Play, FileText, Trophy,
  ChevronLeft        // icône flèche (lucide-react)
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../Shared/ProgressBar';
import styles from '../../../assets/styles/Training/TrainingDetail/TrainingHeader.module.css';


const statusMap = {
  new:         { label: 'Nouvelle',   cls: 'bg-secondary' },
  in_progress: { label: 'En cours',   cls: 'bg-primary'   },
  completed:   { label: 'Terminée',   cls: 'bg-success'   }
};

const TrainingHeader = ({ training }) => {
  const s = statusMap[training.status];
  const navigate  = useNavigate();
  return (
  <section className={`card p-4 mb-4 ${styles.header}`}>
    {/* ─── Ligne 1 : Retour + Titre ────────────────────────────── */}
    <div className="d-flex align-items-center mb-3">
      <button onClick={() => navigate(-1)} className={styles.backBtn} title="Retour">
        <ChevronLeft size={22} />
      </button>
      <h2 className="mb-0">{training.title}</h2>
    </div>
    <span className={`badge ${s.cls} position-absolute top-0 end-0 m-3`}>
      {s.label}
    </span>

    {/* ─── Ligne 2 : méta + pourcentage ───────────────────────── */}
    <div className="d-flex gap-4 small mb-1">
      <span><Clock3 size={14}/> {Math.floor(training.duration/60)} h {training.duration%60} min</span>
      <span><Play size={14}/> {training.chapters.length} chapitres</span>
      {training.resources.length > 0 &&
        <span><FileText size={14}/> {training.resources.length} ressources</span>}
      {training.quiz &&
        <span><Trophy size={14}/> Quiz final</span>}
      <span className="ms-auto">{training.progress}%</span>
    </div>

    {/* ─── Barre de progression ──────────────────────────────── */}
    <ProgressBar value={training.progress} success={training.status === 'completed'} />
  </section>
)};

export default TrainingHeader;
