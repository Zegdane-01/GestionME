// components/training/ChaptersTab.jsx
import React, { useState } from 'react';
import styles from '../../../assets/styles/Training/TrainingDetail/ChaptersTab.module.css';

const ChaptersTab = ({ training }) => {
  const [current, setCurrent] = useState(training.chapters[0]);

  return (
    <div className="row gx-4 mt-4">
      {/* Sidebar chapitres */}
      <aside className="col-lg-3 mb-3">
        <h5 className="mb-3">Chapitres</h5>
        <div className="list-group">
          {training.chapters.map((c, idx) => (
            <button
              key={c.id}
              className={`list-group-item list-group-item-action ${current.id === c.id && styles.active}`}
              onClick={() => setCurrent(c)}
            >
              <span className={styles.badge}>{idx + 1}</span>
              <div>
                <strong className="d-block">{c.title}</strong>
                <small className="text-muted">{c.duration}min</small>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Player */}
      <section className="col-lg-9">
        <h4>{current.title}</h4>
        <p className="text-muted">{current.description}</p>

        <video
          key={current.id}           /* force reload */
          src={current.videoUrl}
          controls
          style={{ width: '100%', borderRadius: 6, background: '#0f172a' }}
        />
      </section>
    </div>
  );
};

export default ChaptersTab;
