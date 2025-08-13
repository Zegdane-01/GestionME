// FlipCard.jsx
import React from 'react';
import './FlipCard.css';

const FlipCard = ({ title, image, content }) => {
  return (
    <div className="col-md-3 flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <img 
            src={image} 
            alt={title} 
            className="card-image"
          />
          <h3 className="flip-card-title">{title}</h3>
        </div>
        
        <div className="flip-card-back bg-light p-4 rounded">
          <div className="card-content">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;