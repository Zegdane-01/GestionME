import React, { useEffect, useState } from "react";
import ProgressBar from "../Shared/ProgressBar";
import api from "../../../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlay,
  faListOl,
  faClock,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { formatDuration } from "../../../utils/formatters";
import styles from "../../../assets/styles/Training/TrainingDetail/QuizTab.module.css";




const QuizTab = ({ quiz = {}, onComplete, isCompleted }) => {
  const questions = quiz.questions ?? [];
  const totalScore = questions.reduce((s, q) => s + (q.point ?? 1), 0);
  
  // --- État Local ---
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  // --- MODIFIÉ : Récupération du score ---
  // Cet effet se déclenche si le quiz est déjà marqué comme complété au chargement
  useEffect(() => {
    if (isCompleted && !finished && quiz.id) {
      api.get(`/quizzes/${quiz.id}/my_result/`)
        .then(res => {
          setScore(res.data.score); // On récupère le score depuis l'API
          setFinished(true); // On force l'affichage de l'écran de résultat
        })
        .catch(() => { /* Gérer l'erreur si besoin */ });
    }
  }, [isCompleted, finished, quiz.id]);

  // --- Reset (inchangé) ---
  useEffect(() => {
    setStarted(false);
    setIdx(0);
    setAnswers({});
    setFinished(false);
    setScore(0);
  }, [quiz]);


  // --- MODIFIÉ : Gestionnaire de soumission ---
  const handleFinish = async () => {
    setFinished(true); // Afficher immédiatement l'écran de fin (même si le score n'est pas encore là)

    // Préparation du payload pour tous les types de questions
    const answersPayload = questions.map(q => {
      const answer = answers[q.id];
      switch (q.type) {
        case 'single_choice':
          return {
            question_id: q.id,
            selected_option_ids: answer !== undefined ? [q.options[answer].id] : [],
          };
        case 'multiple_choice':
          return {
            question_id: q.id,
            selected_option_ids: (answer || []).map(i => q.options[i].id),
          };
        case 'text':
        case 'image_text':
          return {
            question_id: q.id,
            text_response: answer || "",
          };
        default:
          return { question_id: q.id };
      }
    });

    try {
      // On soumet les réponses et on attend le score en retour
      const response = await api.post(`/quizzes/${quiz.id}/submit/`, { answers: answersPayload });
      setScore(response.data.score); // Mise à jour du score avec la réponse de l'API
      onComplete?.(); // Notifier le parent que le quiz est terminé
    } catch (err) {
      console.error("Erreur lors de la soumission du quiz:", err);
      // Gérer l'erreur avec un toast si nécessaire
    }
  };


  // --- NOUVEAU : Gestionnaire de réponse unifié ---
  const handleAnswerChange = (questionId, value, type) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (type === 'multiple_choice') {
        const currentSelection = newAnswers[questionId] || [];
        const valueIndex = currentSelection.indexOf(value);
        if (valueIndex > -1) {
          // Si déjà sélectionné, on le retire
          newAnswers[questionId] = currentSelection.filter(i => i !== value);
        } else {
          // Sinon, on l'ajoute
          newAnswers[questionId] = [...currentSelection, value];
        }
      } else {
        // Pour single_choice, text, image_text
        newAnswers[questionId] = value;
      }
      return newAnswers;
    });
  };

  // --- NOUVEAU : Composant pour rendre le bon type de réponse ---
  const renderAnswerInput = (question) => {
    const selectedAnswer = answers[question.id];

    switch (question.type) {
      case 'single_choice':
        return (
          <div className="list-group mb-4">
            {question.options.map((o, i) => (
              <label key={i} className={`list-group-item list-group-item-action ${styles.listItem} ${selectedAnswer === i ? "active" : ""}`}>
                <input
                  type="radio"
                  name={`q${question.id}`}
                  checked={selectedAnswer === i}
                  onChange={() => handleAnswerChange(question.id, i, question.type)}
                  className="form-check-input me-2"
                />
                {o.texte}
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="list-group mb-4">
            {question.options.map((o, i) => (
              <label key={i} className={`list-group-item list-group-item-action ${styles.listItem} ${(selectedAnswer || []).includes(i) ? "active" : ""}`}>
                <input
                  type="checkbox"
                  checked={(selectedAnswer || []).includes(i)}
                  onChange={() => handleAnswerChange(question.id, i, question.type)}
                  className="form-check-input me-2"
                />
                {o.texte}
              </label>
            ))}
          </div>
        );
      
      case 'image_text':
      case 'text':
        return (
          <div className="mb-4">
            {question.type === 'image_text' && question.image && (
              <img src={question.image} alt="Question" className={`img-fluid rounded mb-3 ${styles.quizImage}`} />
            )}
            <textarea
              className="form-control"
              rows="4"
              placeholder="Saisissez votre réponse ici..."
              value={selectedAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
            ></textarea>
          </div>
        );

      default:
        return <p>Type de question non supporté.</p>;
    }
  };


  // --- BLOCS DE RENDU (Intro et Résultat sont peu modifiés) ---

  // 1. RESULTAT FINAL
  if (finished || isCompleted) {
    return (
        <div className="d-flex flex-column align-items-center mt-5 min-vh-100 px-3">
            <div className={`card p-5 text-center border-0 rounded-4 w-100 ${styles.box}`} >
                <div className="mb-4">
                    <div className="d-flex justify-content-center">
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)' }}>
                            <FontAwesomeIcon icon={faCircleCheck} size="2x" className="text-white" />
                        </div>
                    </div>
                </div>
                <h2 className="mb-3 fw-bold" style={{ color: '#2d3748' }}>Quiz terminé !</h2>
                <div className="mb-4">
                    <p className="fs-5 text-muted mb-1">Votre score final</p>
                    <div className="d-flex justify-content-center align-items-center">
                        <span className="display-4 fw-bold me-2" style={{ color: '#2d3748' }}>
                            {score}
                        </span>
                        <span className="fs-4" style={{ color: '#718096' }}>/ {totalScore}</span>
                    </div>
                </div>
                {/* Logique de message en fonction du score... */}
            </div>
        </div>
    );
  }

  // 2. SI AUCUNE QUESTION
  if (questions.length === 0) return <p>Aucun quiz disponible.</p>;

  // 3. ÉCRAN D’INTRO (inchangé)
  if (!started) {
    const duration = formatDuration(quiz.estimated_time);
    return (
        <div className="d-flex flex-column align-items-center mt-4">
          <div className={`card p-4 mb-4 ${styles.box}`} style={{ maxWidth: 500, width: "100%" }}>
              <div className="text-center">
                  <FontAwesomeIcon icon={faCirclePlay} size="3x" className="text-primary mb-4" />
                  <h4 className="mb-2">Quiz</h4>
                  <p className="text-muted mb-4">{quiz.desc ?? "Testez vos connaissances."}</p>
                  <div className="row text-start justify-content-center mb-4 small">
                      <div className="col-12 mb-2">
                          <FontAwesomeIcon icon={faListOl} className="me-2 text-secondary" />
                          {questions.length}&nbsp;question{questions.length > 1 ? "s" : ""}
                      </div>
                      {duration && (
                          <div className="col-12">
                              <FontAwesomeIcon icon={faClock} className="me-2 text-secondary" />
                              Durée estimée&nbsp;: {duration}
                          </div>
                        )}
                  </div>
                  <button type="button" className="btn btn-primary btn-lg px-4" onClick={() => setStarted(true)}>
                      <FontAwesomeIcon icon={faCirclePlay} className="me-2" />
                      Commencer le quiz
                  </button>
              </div>
          </div>
        </div>
    );
  }

  // --- MODIFIÉ : 4. QUIZ EN COURS ---
  const current = questions[idx];
  const isAnswered = answers[current.id] !== undefined && (
      (Array.isArray(answers[current.id]) && answers[current.id].length > 0) ||
      (!Array.isArray(answers[current.id]) && answers[current.id] !== '')
  );
  const pct = (idx / questions.length) * 100;

  return (
    <div className="d-flex flex-column align-items-center mt-4">
      <div className={`card p-4 ${styles.box}`} style={{ maxWidth: 720, width: "100%" }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Question {idx + 1}/{questions.length}</h5>
          <span className={styles.badgePct}>{Math.round(pct)}%</span>
        </div>
        <ProgressBar value={pct} />

        <p className="mt-4 fs-5">{current.texte}</p>
        
        {/* On appelle notre nouvelle fonction de rendu ici */}
        {renderAnswerInput(current)}

        <div className="d-flex justify-content-between">
          <button className="btn btn-outline-secondary" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>
            Précédent
          </button>
          <button
            className={`btn ${idx + 1 === questions.length ? "btn-success" : "btn-dark"}`}
            disabled={!isAnswered}
            onClick={() => (idx + 1 < questions.length ? setIdx(i => i + 1) : handleFinish())}
          >
            {idx + 1 === questions.length ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTab;