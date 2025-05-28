import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trainings, updateTrainingProgress } from '../../data/trainings';

import TrainingHeader from '../../components/Training/TrainingDetail/TrainingHeader';
import Tabs          from '../../components/Training/TrainingDetail/Tabs';
import OverviewTab   from '../../components/Training/TrainingDetail/OverviewTab';
import ChaptersTab   from '../../components/Training/TrainingDetail/ChaptersTab';
import ResourcesTab  from '../../components/Training/TrainingDetail/ResourcesTab';
import QuizTab       from '../../components/Training/TrainingDetail/QuizTab';

const TrainingDetail = () => {
  const { id } = useParams();
  const [training, setTraining] = useState(trainings.find(t => t.id === Number(id)));
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    // Recharger les données de formation depuis la source
    const updatedTraining = trainings.find(t => t.id === Number(id));
    setTraining(updatedTraining);
  }, [id]);

  if (!training) return <p>Formation introuvable</p>;

  // Fonction pour valider un onglet
  const handleTabCompletion = (tabName) => {
    const updates = {
      tabsCompleted: {
        ...training.tabsCompleted,
        [tabName]: true
      }
    };
    
    updateTrainingProgress(training.id, updates);
    setTraining({ ...training, ...updates });
    
    // Auto-navigation vers l'onglet suivant
    const availableTabs = ['overview'];
    if (training.chapters.length > 0) availableTabs.push('chapters');
    if (training.resources.length > 0) availableTabs.push('resources');
    if (training.quiz) availableTabs.push('quiz');
    
    const currentIndex = availableTabs.indexOf(tabName);
    if (currentIndex !== -1 && currentIndex < availableTabs.length - 1) {
      const nextTab = availableTabs[currentIndex + 1];
      setTab(nextTab);
    }
  };

  // Fonction pour valider un chapitre
  const handleChapterCompletion = (chapterId) => {
    // forme fonctionnelle : on part toujours de la dernière valeur
    setTraining(prev => {
      /* ── 1. marquer le chapitre courant ─────────────────────── */
      const chapters = prev.chapters.map(ch =>
        ch.id === chapterId ? { ...ch, completed: true } : ch
      );
      const allDone = chapters.every(ch => ch.completed);

      /* ── 2. construire l’update + persister ─────────────────── */
      const updates = {
        chapters,
        tabsCompleted: {
          ...prev.tabsCompleted,
          chapters: allDone ? true : prev.tabsCompleted.chapters,
        },
      };
      updateTrainingProgress(prev.id, updates);

      const next = { ...prev, ...updates };

      /* ── 3. si tous finis, passer à l’onglet suivant ─────────── */
      if (allDone) {
        if (next.resources.length)      setTab('resources');
        else if (next.quiz)             setTab('quiz');
        else                            setTab('overview');
      }

      return next;                      // ← nouvelle valeur de training
    });
  };

  return (
    <div className="container pt-4 pb-5">

      {/* ─── Header (titre + badge + méta + progression) */}
      <TrainingHeader training={training} />

      {/* ─── Barre d'onglets */}
      <Tabs
        active={tab}
        onChange={setTab}
        hasResources={training.resources.length > 0}
        hasQuiz={Boolean(training.quiz)}
        tabsCompleted={training.tabsCompleted}
      />

      {/* ─── Contenu des onglets */}
      {tab === 'overview'  && (
        <OverviewTab  
          training={training} 
          onComplete={() => handleTabCompletion('overview')}
          isCompleted={training.tabsCompleted.overview}
        />
      )}
      {tab === 'chapters'  && (
        <ChaptersTab  
          training={training} 
          onChapterComplete={handleChapterCompletion}
          onTabComplete={() => handleTabCompletion('chapters')}
          isTabCompleted={training.tabsCompleted.chapters}
        />
      )}
      {tab === 'resources' && (
        <ResourcesTab 
          training={training} 
          onComplete={() => handleTabCompletion('resources')}
          isCompleted={training.tabsCompleted.resources}
        />
      )}
      {tab === 'quiz'      && (
        <QuizTab      
          quiz={training.quiz} 
          onComplete={() => handleTabCompletion('quiz')}
          isCompleted={training.tabsCompleted.quiz}
        />
      )}
    </div>
  );
};

export default TrainingDetail;