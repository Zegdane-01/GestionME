// components/training/QuizTab.jsx
import React, { useState } from 'react';
import { CheckCircle, Play, Award } from 'lucide-react';
import ProgressBar from '../Shared/ProgressBar';
import styles from '../../../assets/styles/Training/TrainingDetail/QuizTab.module.css';

const QuizTab = ({ quiz, onComplete, isCompleted }) => {
  /* ─── état local ─────────────────────────────────────────── */
  const [quizStarted, setQuizStarted]   = useState(false);
  const [idx,         setIdx]           = useState(0);
  const [answers,     setAnswers]       = useState({});
  const [showResults, setShowResults]   = useState(false);
  const [score,       setScore]         = useState(0);
  const [formDone,    setFormDone]      = useState(false);

  const current = quiz.questions[idx];
  const pct     = (idx / quiz.questions.length) * 100;

  /* ─── helpers ─────────────────────────────────────────────── */
  const calcScore = () =>
    quiz.questions.reduce(
      (sum, q) => (answers[q.id] === q.correctIndex ? sum + q.points : sum),
      0
    );

  const handleStart = () => {
    setQuizStarted(true);
    setIdx(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const handleFinish = () => {
    const final = calcScore();
    setScore(final);
    setShowResults(true);

    /* auto-validation si ≥ 70 % du total */
    if (final >= quiz.totalScore * 0.7) {
      setTimeout(() => {
        setFormDone(true);
        onComplete();
      }, 3000);
    }
  };

  const handleRetry = () => {
    setQuizStarted(false);
    setIdx(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  /* ─── écran “formation terminée” ─────────────────────────── */
  if (isCompleted || formDone) {
    return (
      <div className="d-flex flex-column align-items-center mt-4">
        <div className={`card p-5 mb-4 ${styles.box}`} style={{ maxWidth: 500, width: '100%' }}>
          <div className="text-center">
            <Award size={64} className="text-success mb-4" />
            <h3 className="text-success mb-3">🎉 Formation terminée&nbsp;!</h3>
            <div className="border-top border-bottom py-3 my-4">
              <h5 className="mb-2">Félicitations&nbsp;!</h5>
              <p className="text-muted mb-1">Vous avez validé la formation&nbsp;:</p>
              <p className="fw-bold">{quiz.title ?? 'Formation'}</p>
            </div>
            <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-success" />
              <span className="text-success fw-semibold">Formation validée</span>
            </div>
            <p className="text-muted small">
              Votre progression a été enregistrée&nbsp;— vous pouvez passer à la suite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── écran résultats ─────────────────────────────────────── */
  if (showResults) {
    const pass = score >= quiz.totalScore * 0.7;
    return (
      <div className="d-flex flex-column align-items-center mt-4">
        <div className={`card p-4 mb-4 ${styles.box}`}>
          <div className="text-center">
            {pass ? (
              <>
                <CheckCircle size={48} className="text-success mb-3" />
                <h4 className="text-success">Félicitations&nbsp;!</h4>
                <p>Vous avez obtenu <strong>{score}/{quiz.totalScore} pts</strong></p>
                <div className="spinner-border spinner-border-sm text-success me-2" />
                <p className="text-muted">Validation en cours…</p>
              </>
            ) : (
              <>
                <div className="text-warning mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </div>
                <h4 className="text-warning">Score insuffisant</h4>
                <p>Vous avez obtenu <strong>{score}/{quiz.totalScore} pts</strong></p>
                <p className="text-muted mb-3">Minimum requis&nbsp;: {Math.ceil(quiz.totalScore*0.7)} pts.</p>
                <button className="btn btn-primary" onClick={handleRetry}>
                  Recommencer le quiz
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─── page d’accueil du quiz ──────────────────────────────── */
  if (!quizStarted) {
    return (
      <div className="d-flex flex-column align-items-center mt-4">
        <div className={`card p-4 mb-4 ${styles.box}`} style={{ maxWidth: 500, width: '100%' }}>
          <div className="text-center">
            <Play size={48} className="text-primary mb-4" />
            <h4 className="mb-3">Quiz&nbsp;– {quiz.title ?? 'Formation'}</h4>
            <p className="text-muted mb-4">{quiz.desc ?? 'Testez vos connaissances.'}</p>

            <div className="row text-start mb-4">
              <div className="col-12 mb-2">
                <span className="badge bg-light text-dark me-2">📝</span>
                {quiz.questions.length} questions
              </div>
              <div className="col-12">
                <span className="badge bg-light text-dark me-2">🎯</span>
                Score minimum&nbsp;: {Math.ceil(quiz.totalScore*0.7)}/{quiz.totalScore}
              </div>
            </div>

            <button className="btn btn-primary btn-lg px-4" onClick={handleStart}>
              <Play size={20} className="me-2" /> Commencer le quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── quiz en cours ───────────────────────────────────────── */
  return (
    <div className="d-flex flex-column align-items-center mt-4">
      <div className={`card p-4 mb-4 ${styles.box}`}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="mb-0">Quiz – {quiz.title ?? 'Formation'}</h4>
          <span className={styles.badgePct}>{Math.round(pct)}%</span>
        </div>
        {quiz.desc && <p className="text-muted">{quiz.desc}</p>}

        <div className="small text-muted mb-2">
          🛈 Question {idx + 1} / {quiz.questions.length}
        </div>

        <ProgressBar value={pct} />

        <h5 className="mt-4 mb-2">Question {idx + 1}</h5>
        <p>{current.text}</p>

        <div className="list-group mb-4" style={{ width : '60vw', overflowX: 'auto' }}>
          {current.options.map((opt, i) => (
            <label
              key={i}
              className={`list-group-item list-group-item-action ${styles.listItem} ${
                answers[current.id] === i ? 'active' : ''
              }`}
            >
              <input
                type="radio"
                name={`q${current.id}`}
                checked={answers[current.id] === i}
                onChange={() => setAnswers({ ...answers, [current.id]: i })}
                className="form-check-input me-2"
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="btn btn-outline-secondary"
            disabled={idx === 0}
            onClick={() => setIdx(i => i - 1)}
          >
            Précédent
          </button>

          <span className="align-self-center small text-muted">
            {Object.keys(answers).length}/{quiz.questions.length} réponses
          </span>

          <button
            className={`btn ${idx + 1 === quiz.questions.length ? 'btn-success' : 'btn-dark'}`}
            disabled={answers[current.id] === undefined}
            onClick={() =>
              idx + 1 < quiz.questions.length
                ? setIdx(i => i + 1)
                : handleFinish()
            }
          >
            {idx + 1 === quiz.questions.length ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTab;
