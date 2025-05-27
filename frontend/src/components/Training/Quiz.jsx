// Quiz.jsx
import React, { useState } from 'react';
import Question from './Question';

const Quiz = ({ quiz }) => {
  const [score, setScore] = useState(null);

  const handleSubmit = answers => {
    const result = answers.reduce(
      (acc, correct) => acc + (correct ? 1 : 0),
      0
    );
    setScore(result);
  };

  return (
    <div>
      {score === null ? (
        <QuestionList quiz={quiz} onSubmit={handleSubmit} />
      ) : (
        <h4>
          Votre score : {score}/{quiz.questions.length}
        </h4>
      )}
    </div>
  );
};

const QuestionList = ({ quiz, onSubmit }) => {
  const [answers, setAnswers] = useState({});

  const toggle = (qId, idx) =>
    setAnswers(prev => ({ ...prev, [qId]: idx }));

  const finish = () => {
    const verdicts = quiz.questions.map(
      q => answers[q.id] === q.correctIndex
    );
    onSubmit(verdicts);
  };

  return (
    <>
      {quiz.questions.map(q => (
        <Question
          key={q.id}
          data={q}
          chosen={answers[q.id]}
          onChoose={idx => toggle(q.id, idx)}
        />
      ))}
      <button className="btn btn-success mt-3" onClick={finish}>
        Soumettre
      </button>
    </>
  );
};

export default Quiz;
