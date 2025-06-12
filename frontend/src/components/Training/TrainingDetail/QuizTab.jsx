import React, { useEffect, useState } from "react";
import { CheckCircle, Play, Award } from "lucide-react";
import ProgressBar from "../Shared/ProgressBar";
import styles from "../../../assets/styles/Training/TrainingDetail/QuizTab.module.css";

/**
 * Onglet Quiz – respecte strictement les règles des hooks.
 */
const QuizTab = ({ quiz = {}, onComplete, isCompleted }) => {
  const questions = quiz.questions ?? [];
  const totalScore = questions.reduce((s, q) => s + (q.point ?? 1), 0);
  const passMark = Math.ceil(totalScore * 0.7);

  /* ---------------- Hooks (toujours appelés) ----------------- */
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // reset si le quiz change (ou au 1er mount)
    setStarted(false);
    setIdx(0);
    setAnswers({});
    setFinished(false);
    setScore(0);
  }, [quiz]);

  /* ---------------- Helpers ---------------------------------- */
  const calcScore = () =>
    questions.reduce((sum, q) => {
      const sel = answers[q.id];
      const correctIdx = q.options.findIndex((o) => o.is_correct);
      return sel === correctIdx ? sum + (q.point ?? 1) : sum;
    }, 0);

  const handleFinish = () => {
    const s = calcScore();
    setScore(s);
    setFinished(true);
    if (s >= passMark) onComplete?.();
  };

  /* ---------------- Early exit if no questions --------------- */
  if (questions.length === 0) return <p>Aucun quiz disponible.</p>;

  const current = questions[idx];
  const pct = (idx / questions.length) * 100;

  /* ---------------- UI branches ------------------------------ */
  if (isCompleted) {
    return (
      <div className="text-center mt-4">
        <Award size={64} className="text-success mb-3" />
        <h3 className="text-success">Quiz déjà validé !</h3>
      </div>
    );
  }

  if (finished) {
    const pass = score >= passMark;
    return (
      <div className="d-flex flex-column align-items-center mt-4">
        <div className={`card p-4 ${styles.box}`} style={{ maxWidth: 480 }}>
          {pass ? (
            <>
              <CheckCircle size={48} className="text-success mb-3" />
              <h4 className="text-success">Bravo&nbsp;!</h4>
              <p>Score&nbsp;: {score}/{totalScore}</p>
            </>
          ) : (
            <>
              <h4 className="text-warning">Score insuffisant</h4>
              <p>Score&nbsp;: {score}/{totalScore} (min&nbsp;{passMark})</p>
              <button className="btn btn-primary" onClick={() => setStarted(false)}>
                Recommencer
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="d-flex flex-column align-items-center mt-4">
        <div className={`card p-4 ${styles.box}`} style={{ maxWidth: 480 }}>
          <Play size={48} className="text-primary mb-3" />
          <h4 className="mb-3">Quiz – {quiz.title ?? "Formation"}</h4>
          <p className="text-muted mb-4">{questions.length} questions – minimum&nbsp;: {passMark}/{totalScore}</p>
          <button className="btn btn-primary" onClick={() => setStarted(true)}>
            <Play size={20} className="me-2" /> Commencer
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- Quiz en cours ---------------------------- */
  const selected = answers[current.id];

  return (
    <div className="d-flex flex-column align-items-center mt-4">
      <div className={`card p-4 ${styles.box}`} style={{ maxWidth: 720, width: "100%" }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Question {idx + 1}/{questions.length}</h5>
          <span className={styles.badgePct}>{Math.round(pct)}%</span>
        </div>
        <ProgressBar value={pct} />

        <p className="mt-4">{current.texte}</p>

        <div className="list-group mb-4">
          {current.options.map((o, i) => (
            <label
              key={i}
              className={`list-group-item list-group-item-action ${styles.listItem} ${selected === i ? "active" : ""}`}
            >
              <input
                type="radio"
                name={`q${current.id}`}
                checked={selected === i}
                onChange={() => setAnswers({ ...answers, [current.id]: i })}
                className="form-check-input me-2"
              />
              {o.texte}
            </label>
          ))}
        </div>

        <div className="d-flex justify-content-between">
          <button className="btn btn-outline-secondary" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
            Précédent
          </button>
          <button
            className={`btn ${idx + 1 === questions.length ? "btn-success" : "btn-dark"}`}
            disabled={selected === undefined}
            onClick={() => (idx + 1 < questions.length ? setIdx((i) => i + 1) : handleFinish())}
          >
            {idx + 1 === questions.length ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTab;
