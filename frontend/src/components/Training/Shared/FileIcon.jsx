// shared/FileIcon.jsx  (petit rendu minimal, à étoffer si besoin)
import React from 'react';
import { FileText } from 'lucide-react';

const colors = { pdf: '#ef4444', xls: '#10b981', xlsx: '#10b981', ppt: '#ea580c' };

const FileIcon = ({ ext }) => (
  <div
    style={{
      width: 24,
      height: 24,
      borderRadius: 4,
      background: (colors[ext] ?? '#cbd5e1') + '22',
      color: colors[ext] ?? '#334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <FileText size={14} />
  </div>
);

export default FileIcon;
