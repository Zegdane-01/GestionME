//
// /src/utils/formatters.js (exemple de fichier utilitaire)
//
export const formatDuration = (durationString) => {
  // 1. On ajoute une "garde" pour vérifier l'entrée.
  // Si ce n'est pas une chaîne de caractères, on ne fait rien.
  if (!durationString || typeof durationString !== 'string') {
    return null; // ou retourner une chaîne vide "" si vous préférez
  }

  // Le reste du code ne s'exécutera que si durationString est valide.
  const parts = durationString.split(':');
  if (parts.length < 3) {
    return null; // Gère les formats incorrects
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  
  const result = [];
  if (hours > 0) {
    result.push(`${hours} h`);
  }
  if (minutes > 0) {
    result.push(`${minutes} min`);
  }
  if (seconds > 0) {
    result.push(`${seconds} s`);
  }

  return result.join(' ');
};

export const formatSecondsToReadableTime = (totalSeconds) => {
  if (totalSeconds === null || isNaN(totalSeconds) || totalSeconds < 0) {
    return "0s";
  }

  if (totalSeconds === 0) {
    return "0s";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(' ');
};