import React from 'react';

const Chapter = ({ chapter }) => (
  <div className="mb-4">
    <h5>{chapter.title}</h5>
    <video
      className="w-100 rounded mb-2"
      controls
      src={chapter.videoUrl}
    />
    <p className="small">{chapter.description}</p>
  </div>
);

export default Chapter;
