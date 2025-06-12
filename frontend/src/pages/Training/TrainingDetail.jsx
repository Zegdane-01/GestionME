import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/api";

import TrainingHeader from "../../components/Training/TrainingDetail/TrainingHeader";
import Tabs from "../../components/Training/TrainingDetail/Tabs";
import OverviewTab from "../../components/Training/TrainingDetail/OverviewTab";
import ChaptersTab from "../../components/Training/TrainingDetail/ChaptersTab";
import ResourcesTab from "../../components/Training/TrainingDetail/ResourcesTab";
import QuizTab from "../../components/Training/TrainingDetail/QuizTab";

/* ------------------------------------------------------------- */
/* Loader                                                         */
/* ------------------------------------------------------------- */
const Loader = () => (
  <div className="d-flex justify-content-center py-5">
    <div className="spinner-border" role="status" />
  </div>
);

/* ------------------------------------------------------------- */
/* Composant                                                      */
/* ------------------------------------------------------------- */
const TrainingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  /* ----------------------------------------------------------- */
  /* 1. Récupération formation + état utilisateur                */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/formations/${id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        });
        // Sécurise les tableaux pour éviter les undefined.length
        setTraining({...data,
          tabsCompleted: {
            overview:   data.tabsCompleted?.overview   ?? false,
            modules:    data.tabsCompleted?.modules    ?? false,
            resources:  data.tabsCompleted?.resources  ?? false,
            quiz:       data.tabsCompleted?.quiz       ?? false,
          },
        });
      } catch (err) {
        toast.error("Formation introuvable ou inaccessible");
        navigate("/trainings", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ----------------------------------------------------------- */
  /* 2. Helpers persistance                                       */
  /* ----------------------------------------------------------- */
  const persist = async (updates) => {
    if (!training?.userFormationId) return;
    try {
      await api.patch(`/user-formations/${training.userFormationId}/`, updates);
    } catch (e) {
      // Optionnel : erreur silencieuse
    }
  };

  /* ----------------------------------------------------------- */
  /* 3. Handlers                                                  */
  /* ----------------------------------------------------------- */
  const handleTabCompletion = (tabName) => {
    setTraining((prev) => {
      const updates = {
        tabsCompleted: {
          ...prev.tabsCompleted,
          [tabName]: true,
        },
      };
      persist(updates);
      return { ...prev, ...updates };
    });

    // Navigation automatique vers l'onglet suivant
    const availableTabs = ["overview"];
    if (training?.modules?.length) availableTabs.push("modules");
    if (training?.ressources?.length) availableTabs.push("resources");
    if (training?.quiz) availableTabs.push("quiz");
    const idx = availableTabs.indexOf(tabName);
    if (idx !== -1 && idx < availableTabs.length - 1) setTab(availableTabs[idx + 1]);
  };

  const handleChapterCompletion = (moduleId) => {
    setTraining((prev) => {
      const modules = prev.modules.map((c) =>
        c.id === moduleId ? { ...c, completed: true } : c
      );
      const allDone = modules.every((c) => c.completed);
      const updates = {
        modules,
        tabsCompleted: {
          ...prev.tabsCompleted,
          modules: allDone ? true : prev.tabsCompleted.modules,
        },
      };
      persist(updates);
      if (allDone) {
        if (prev.ressources.length)      setTab("resources");
        else if (prev.quiz)             setTab("quiz");
        else                            setTab("overview");
      }
      return { ...prev, ...updates };
    });
  };

  /* ----------------------------------------------------------- */
  /* 4. Préparation des onglets                                   */
  /* ----------------------------------------------------------- */
  const tabProps = useMemo(() => (
    training
      ? {
          overview: {
            component: OverviewTab,
            props: {
              training,
              onComplete: () => handleTabCompletion("overview"),
              isCompleted: training.tabsCompleted.overview,
            },
          },
          modules: {
            component: ChaptersTab,
            props: {
              training,
              onChapterComplete: handleChapterCompletion,
              onTabComplete: () => handleTabCompletion("modules"),
              isTabCompleted: training.tabsCompleted.modules,
            },
          },
          resources: {
            component: ResourcesTab,
            props: {
              training,
              onComplete: () => handleTabCompletion("resources"),
              isCompleted: training.tabsCompleted.resources,
            },
          },
          quiz: {
            component: QuizTab,
            props: {
              quiz: training.quiz,
              onComplete: () => handleTabCompletion("quiz"),
              isCompleted: training.tabsCompleted.quiz,
            },
          },
        }
      : {}
  ), [training]);

  /* ----------------------------------------------------------- */
  /* 5. Rendu                                                    */
  /* ----------------------------------------------------------- */
  if (loading) return <Loader />;
  if (!training) return null; // Redirigé vers la liste plus tôt

  const ActiveTab = tabProps[tab]?.component;

  return (
    <div className="container pt-4 pb-5">
      {/* Header */}
      <TrainingHeader training={training} />

      {/* Tabs */}
      <Tabs
        active={tab}
        onChange={setTab}
        hasResources={(training.ressources?.length ?? 0) > 0}
        hasQuiz={Boolean(training.quiz)}
        tabsCompleted={training.tabsCompleted}
      />

      {/* Active tab content */}
      {ActiveTab && <ActiveTab {...tabProps[tab].props} />}
    </div>
  );
};

export default TrainingDetail;
