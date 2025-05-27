import React from 'react';
import {
  faFileAlt,      // Fichier générique
} from '@fortawesome/free-solid-svg-icons';
const ResourceViewer = ({ file }) => (
  <div className="d-flex align-items-center gap-3 mb-3">
    <div style={{ width: 40 }}>
      <faFilePdf extension={file.name.split('.').pop()} {...faFileAlt.docx} />
    </div>
    <a href={file.url} target="_blank" rel="noopener noreferrer">
      {file.name}
    </a>
  </div>
);

export default ResourceViewer;
