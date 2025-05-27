// components/training/QuizTab.jsx  (version simplifiée)
import React, { useState, useEffect } from 'react';
import ProgressBar from '../Shared/ProgressBar';
import styles from '../../../assets/styles/Training/TrainingDetail/QuizTab.module.css';

const QuizTab = ({ quiz }) => {
  const [idx, setIdx]   = useState(0);
  const [answers, setAnswers] = useState({});
  const [seconds, setSeconds] = useState(15 * 60);      // 15 min

  // compte à rebours
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const current = quiz.questions[idx];
  const pct     = (idx / quiz.questions.length) * 100;

  return (
    <div className="d-flex flex-column align-items-center mt-4">
      <div className={`card p-4 mb-4 ${styles.box}`}>
        <h4 className="mb-1">Quiz - {quiz.title ?? 'Formation'}</h4>
        <p className="text-muted mb-3">{quiz.desc ?? ''}</p>

        <div className="d-flex gap-4 small mb-2">
          <span>Question {idx + 1} sur {quiz.questions.length}</span>
          <span className="ms-auto">⏰ {String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</span>
        </div>

        <ProgressBar value={pct} />

        {/* Question */}
        <h5 className="mt-4 mb-2">Question {idx + 1}</h5>
        <p>{current.text}</p>

        <div className="list-group mb-4">
          {current.options.map((opt, i) => (
            <label key={i} className="list-group-item">
              <input
                type="radio"
                name={`q${current.id}`}
                checked={answers[current.id] === i}
                onChange={() => setAnswers({...answers, [current.id]: i})}
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
            className="btn btn-dark"
            disabled={!answers[current.id]}
            onClick={() =>
              idx + 1 < quiz.questions.length ? setIdx(i => i + 1) : alert('fin !')
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
