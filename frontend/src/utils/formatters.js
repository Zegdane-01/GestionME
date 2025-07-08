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
  
  const result = [];
  if (hours > 0) {
    result.push(`${hours} heure${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    result.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  // Si la durée est de moins d'une minute
  if (result.length === 0) {
    return "Moins d'une minute";
  }

  return result.join(' et ');
};