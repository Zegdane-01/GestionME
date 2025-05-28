// hooks/useTrainingProgress.js
import { useState, useEffect, useMemo } from 'react';

export default function useTrainingProgress(baseTraining) {
  // State pour maintenir les progrès en mémoire
  const [progressState, setProgressState] = useState(() => {
    if (!baseTraining) return null;
    
    // Initialiser avec les données de base
    return {
      ...baseTraining,
      // S'assurer que les chapitres ont la propriété completed
      chapters: baseTraining.chapters.map(chapter => ({
        ...chapter,
        completed: chapter.completed || false
      })),
      // S'assurer que les ressources ont la propriété read
      resources: baseTraining.resources.map(resource => ({
        ...resource,
        read: resource.read || false
      })),
      // S'assurer que le quiz a les bonnes propriétés
      quiz: baseTraining.quiz ? {
        ...baseTraining.quiz,
        finished: baseTraining.quiz.finished || false,
        score: baseTraining.quiz.score || null
      } : null
    };
  });

  // Calculer le pourcentage de progression
  const calculatedProgress = useMemo(() => {
    if (!progressState) return 0;

    const totalChapters = progressState.chapters.length;
    const completedChapters = progressState.chapters.filter(c => c.completed).length;
    
    const totalResources = progressState.resources.length;
    const readResources = progressState.resources.filter(r => r.read).length;
    
    const quizCompleted = progressState.quiz?.finished ? 1 : 0;
    const totalQuizzes = progressState.quiz ? 1 : 0;

    const totalItems = totalChapters + totalResources + totalQuizzes;
    const completedItems = completedChapters + readResources + quizCompleted;

    if (totalItems === 0) return 0;
    
    return Math.round((completedItems / totalItems) * 100);
  }, [progressState]);

  // Déterminer le statut de la formation
  const calculatedStatus = useMemo(() => {
    if (!progressState) return 'new';
    
    if (calculatedProgress === 100) return 'completed';
    if (calculatedProgress > 0) return 'in_progress';
    return 'new';
  }, [calculatedProgress, progressState]);

  // Mettre à jour le progrès et le statut
  useEffect(() => {
    if (progressState) {
      setProgressState(prev => ({
        ...prev,
        progress: calculatedProgress,
        status: calculatedStatus
      }));
    }
  }, [calculatedProgress, calculatedStatus]);

  // Fonction pour marquer un chapitre comme terminé
  const markChapter = (chapterId) => {
    setProgressState(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter =>
        chapter.id === chapterId 
          ? { ...chapter, completed: true }
          : chapter
      )
    }));
  };

  // Fonction pour marquer une ressource comme lue
  const markResource = (resourceId) => {
    setProgressState(prev => ({
      ...prev,
      resources: prev.resources.map(resource =>
        resource.id === resourceId 
          ? { ...resource, read: true }
          : resource
      )
    }));
  };

  // Fonction pour finaliser le quiz
  const finishQuiz = (score) => {
    setProgressState(prev => ({
      ...prev,
      quiz: prev.quiz ? {
        ...prev.quiz,
        finished: true,
        score: score
      } : null
    }));
  };

  // Fonction pour marquer tous les chapitres comme terminés
  const markAllChaptersCompleted = () => {
    setProgressState(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter => ({
        ...chapter,
        completed: true
      }))
    }));
  };

  // Fonction pour marquer toutes les ressources comme lues
  const markAllResourcesRead = () => {
    setProgressState(prev => ({
      ...prev,
      resources: prev.resources.map(resource => ({
        ...resource,
        read: true
      }))
    }));
  };

  // Fonction pour réinitialiser le progrès
  const resetProgress = () => {
    if (baseTraining) {
      setProgressState({
        ...baseTraining,
        chapters: baseTraining.chapters.map(chapter => ({
          ...chapter,
          completed: false
        })),
        resources: baseTraining.resources.map(resource => ({
          ...resource,
          read: false
        })),
        quiz: baseTraining.quiz ? {
          ...baseTraining.quiz,
          finished: false,
          score: null
        } : null,
        progress: 0,
        status: 'new'
      });
    }
  };

  // Vérifier si tous les chapitres sont terminés
  const allChaptersCompleted = useMemo(() => {
    return progressState?.chapters.every(c => c.completed) || false;
  }, [progressState?.chapters]);

  // Vérifier si toutes les ressources sont lues
  const allResourcesRead = useMemo(() => {
    return progressState?.resources.every(r => r.read) || false;
  }, [progressState?.resources]);

  // Vérifier si le quiz est terminé
  const quizCompleted = useMemo(() => {
    return progressState?.quiz?.finished || false;
  }, [progressState?.quiz]);

  // Vérifier si la formation est entièrement terminée
  const isFullyCompleted = useMemo(() => {
    return allChaptersCompleted && 
           (progressState?.resources.length === 0 || allResourcesRead) && 
           (!progressState?.quiz || quizCompleted);
  }, [allChaptersCompleted, allResourcesRead, quizCompleted, progressState]);

  return {
    // État principal
    state: progressState,
    
    // Actions de progression
    markChapter,
    markResource,
    finishQuiz,
    
    // Actions groupées
    markAllChaptersCompleted,
    markAllResourcesRead,
    resetProgress,
    
    // Informations calculées
    progress: calculatedProgress,
    status: calculatedStatus,
    
    // États de completion
    allChaptersCompleted,
    allResourcesRead,
    quizCompleted,
    isFullyCompleted,
    
    // Statistiques
    stats: {
      chaptersCompleted: progressState?.chapters.filter(c => c.completed).length || 0,
      totalChapters: progressState?.chapters.length || 0,
      resourcesRead: progressState?.resources.filter(r => r.read).length || 0,
      totalResources: progressState?.resources.length || 0,
      quizScore: progressState?.quiz?.score || null,
      quizMaxScore: progressState?.quiz?.totalScore || null
    }
  };
}