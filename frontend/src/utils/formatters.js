//
// /src/utils/formatters.js (exemple de fichier utilitaire)
//
export const formatDuration = (durationString) => {
  if (!durationString || durationString === "00:00:00") return null;

  // S'assure de gérer les formats avec ou sans secondes
  const parts = durationString.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  
  const timeParts = [];
  if (hours > 0) {
    timeParts.push(`${hours} h`);
  }
  if (minutes > 0) {
    timeParts.push(`${minutes} min`);
  }

  if (timeParts.length === 0) return null;

  return timeParts.join(' ');
};