// Question.jsx
import React from 'react';

const Question = ({ data, chosen, onChoose }) => (
  <div className="mb-4">
    <p>
      <strong>{data.text}</strong>{' '}
      <span className="badge bg-secondary">{data.points} pts</span>
    </p>
    {data.options.map((opt, idx) => (
      <div className="form-check" key={idx}>
        <input
          className="form-check-input"
          type="radio"
          name={`q${data.id}`}
          id={`q${data.id}_${idx}`}
          checked={chosen === idx}
          onChange={() => onChoose(idx)}
        />
        <label className="form-check-label" htmlFor={`q${data.id}_${idx}`}>
          {opt}
        </label>
      </div>
    ))}
  </div>
);

export default Question;
