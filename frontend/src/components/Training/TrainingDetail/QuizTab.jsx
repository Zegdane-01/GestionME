import React, { useEffect, useState } from "react";
import ProgressBar from "../Shared/ProgressBar";
import api from "../../../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlay,
  faListOl,
  faClock,
  faCircleCheck      // ✅ icône résultat
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../../assets/styles/Training/TrainingDetail/QuizTab.module.css";

const quizDuration = (hhmmss = "00:00:00") => {
  const [h, m] = hhmmss.split(":").map(Number);
  const totalMin = h * 60 + m;
  return totalMin ? `${totalMin} min` : "—";
};

const QuizTab = ({ quiz = {}, onComplete, isCompleted }) => {
  const questions   = quiz.questions ?? [];
  const totalScore  = questions.reduce((s, q) => s + (q.point ?? 1), 0);
  console.log(quiz);

  /* ---- état local ------------------------------------------------------ */
  const [started,  setStarted]  = useState(false);
  const [idx,      setIdx]      = useState(0);
  const [answers,  setAnswers]  = useState({});
  const [finished, setFinished] = useState(false);
  const [score,    setScore]    = useState(0);
  const [serverScore, setServerScore] = useState(null);

  useEffect(() => {
    if (isCompleted && !finished && quiz.id) {
      api.get(`/quizzes/${quiz.id}/my_result/`)
        .then(res => {
            setScore(res.data.score);
            setFinished(true);      // forcer l’affichage résultat
        })
        .catch(() => {/* handle */});
    }
  }, [isCompleted, finished, quiz.id]);
  // Score à afficher
  const finalScore = finished        ? score
                    : serverScore    ?? "—";

  useEffect(() => {
    // reset si le quiz change
    setStarted(false);
    setIdx(0);
    setAnswers({});
    setFinished(false);
    setScore(0);
  }, [quiz]);

  /* ---- helpers --------------------------------------------------------- */
  const calcScore = () =>
    questions.reduce((sum, q) => {
      const sel        = answers[q.id];
      const correctIdx = q.options.findIndex(o => o.is_correct);
      return sel === correctIdx ? sum + (q.point ?? 1) : sum;
    }, 0);

  const handleFinish = async () => {
    const s = calcScore();          // score local, pour affichage immédiat
    setScore(s);
    setFinished(true);
    onComplete?.();

    // préparation du payload
    const answersPayload = questions.map(q => {
      if (q.type === "single_choice") {
        const sel = answers[q.id];
        return {
          question_id: q.id,
          selected_option_ids: sel !== undefined ? [q.options[sel].id] : []
        };
      } else if (q.type === "multiple_choice") {
        const selIdx = answers[q.id] || []; // tableau d'index
        return {
          question_id: q.id,
          selected_option_ids: selIdx.map(i => q.options[i].id)
        };
      } else {
        return {
          question_id: q.id,
          text_response: answers[q.id] || ""
        };
      }
    });

    try {
      await api.post(`/quizzes/${quiz.id}/submit/`, { answers: answersPayload });
      onComplete?.();               // pour rafraîchir la fiche de formation
    } catch (err) {
      console.error(err);
      // toast erreur…
    }
  };

  /* ---------------------------------------------------------------------- */
  // 1. RESULTAT FINAL (fini ou déjà complété)
  if (finished || isCompleted) {
    // si le score n'est pas connu (cas déjà complété), on tente de le lire dans quiz.user_score
    const finalScore = finished ? score : quiz.user_score ?? "—";
    return (
  <div className="d-flex flex-column align-items-center mt-5 min-vh-100 px-3">
    <div 
      className={`card p-5 text-center border-0 rounded-4 w-100 ${styles.box}`} 
    >
      <div className="mb-4">
        <div className="d-flex justify-content-center">
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)'
          }}>
            <FontAwesomeIcon
              icon={faCircleCheck}
              size="2x"
              className="text-white"
            />
          </div>
        </div>
      </div>

      <h2 className="mb-3 fw-bold" style={{ color: '#2d3748' }}>
        Quiz terminé avec succès !
      </h2>

      <div className="mb-4">
        <p className="fs-5 text-muted mb-1">Votre score final</p>
        <div className="d-flex justify-content-center align-items-center">
          <span 
            className="display-4 fw-bold me-2" 
            style={{ color: '#2d3748' }}
          >
            {finalScore}
          </span>
          <span className="fs-4" style={{ color: '#718096' }}>/ {totalScore}</span>
        </div>
      </div>

      {finalScore === totalScore ? (
        <div className="alert alert-success mt-3" role="alert">
          <strong>Parfait !</strong> Vous avez répondu correctement à toutes les questions.
        </div>
      ) : finalScore >= totalScore * 0.7 ? (
        <div className="alert alert-info mt-3" role="alert">
          <strong>Bien joué !</strong> Vous maîtrisez bien ce sujet.
        </div>
      ) : (
        <div className="alert alert-warning mt-3" role="alert">
          <strong>Presque !</strong> Encore un peu de pratique et vous y serez.
        </div>
      )}
    </div>
  </div>
);
  }

  /* ---------------------------------------------------------------------- */
  // 2. SI AUCUNE QUESTION
  if (questions.length === 0) return <p>Aucun quiz disponible.</p>;

  /* ---------------------------------------------------------------------- */
  // 3. ÉCRAN D’INTRO
  if (!started) {
    return (
      <div className="d-flex flex-column align-items-center mt-4">
        <div
          className={`card p-4 mb-4 ${styles.box}`}
          style={{ maxWidth: 500, width: "100%" }}
        >
          <div className="text-center">
            <FontAwesomeIcon
              icon={faCirclePlay}
              size="3x"
              className="text-primary mb-4"
            />

            <h4 className="mb-2">Quiz</h4>
            <p className="text-muted mb-4">
              {quiz.desc ?? "Testez vos connaissances."}
            </p>

            <div className="row text-start justify-content-center mb-4 small">
              <div className="col-12 mb-2">
                <FontAwesomeIcon icon={faListOl} className="me-2 text-secondary" />
                {questions.length}&nbsp;question{questions.length > 1 ? "s" : ""}
              </div>
              <div className="col-12">
                <FontAwesomeIcon icon={faClock} className="me-2 text-secondary" />
                Durée estimée&nbsp;: {quizDuration(quiz.estimated_time)}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg px-4"
              onClick={() => setStarted(true)}
            >
              <FontAwesomeIcon icon={faCirclePlay} className="me-2" />
              Commencer le quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  // 4. QUIZ EN COURS
  const current   = questions[idx];
  const selected  = answers[current.id];
  const pct       = (idx / questions.length) * 100;

  return (
    <div className="d-flex flex-column align-items-center mt-4">
      <div
        className={`card p-4 ${styles.box}`}
        style={{ maxWidth: 720, width: "100%" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">
            Question {idx + 1}/{questions.length}
          </h5>
          <span className={styles.badgePct}>{Math.round(pct)}%</span>
        </div>
        <ProgressBar value={pct} />

        <p className="mt-4">{current.texte}</p>

        <div className="list-group mb-4">
          {current.options.map((o, i) => (
            <label
              key={i}
              className={`list-group-item list-group-item-action ${styles.listItem} ${
                selected === i ? "active" : ""
              }`}
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
          <button
            className="btn btn-outline-secondary"
            disabled={idx === 0}
            onClick={() => setIdx(i => i - 1)}
          >
            Précédent
          </button>

          <button
            className={`btn ${
              idx + 1 === questions.length ? "btn-success" : "btn-dark"
            }`}
            disabled={selected === undefined}
            onClick={() =>
              idx + 1 < questions.length ? setIdx(i => i + 1) : handleFinish()
            }
          >
            {idx + 1 === questions.length ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTab;
