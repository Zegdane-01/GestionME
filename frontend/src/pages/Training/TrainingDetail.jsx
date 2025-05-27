import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { trainings } from '../../data/trainings';

import TrainingHeader from '../../components/Training/TrainingDetail/TrainingHeader';
import Tabs          from '../../components/Training/TrainingDetail/Tabs';
import OverviewTab   from '../../components/Training/TrainingDetail/OverviewTab';
import ChaptersTab   from '../../components/Training/TrainingDetail/ChaptersTab';
import ResourcesTab  from '../../components/Training/TrainingDetail/ResourcesTab';
import QuizTab       from '../../components/Training/TrainingDetail/QuizTab';

const TrainingDetail = () => {
  const { id } = useParams();
  const training  = trainings.find(t => t.id === Number(id));
  const [tab, setTab] = useState('overview');

  if (!training) return <p>Formation introuvable</p>;

  return (
    <div className="container pt-4 pb-5">

      {/* ─── Header (titre + badge + méta + progression) */}
      <TrainingHeader training={training} />

      {/* ─── Barre d’onglets */}
      <Tabs
        active={tab}
        onChange={setTab}
        hasResources={training.resources.length > 0}
        hasQuiz={Boolean(training.quiz)}
      />

      {/* ─── Contenu des onglets */}
      {tab === 'overview'  && <OverviewTab  training={training} />}
      {tab === 'chapters'  && <ChaptersTab  training={training} />}
      {tab === 'resources' && <ResourcesTab training={training} />}
      {tab === 'quiz'      && <QuizTab      quiz={training.quiz} />}
    </div>
  );
};

export default TrainingDetail;
