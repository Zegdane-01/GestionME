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
  const { id: formationId } = useParams(); 
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
        const { data } = await api.get(`/user-formations/by-formation/${formationId}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        });
        // Sécurise les tableaux pour éviter les undefined.length
        setTraining(data);
      } catch (err) {
        toast.error("Formation introuvable ou inaccessible");
        navigate("/formations", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId]);

  /* ----------------------------------------------------------- */
  /* 2. Helpers persistance                                       */
  /* ----------------------------------------------------------- */
  const persist = async (updates) => {
    if(!formationId) return;
    try {
      // On envoie la mise à jour et on attend la nouvelle version complète de l'objet "training"
      const { data: updatedTraining } = await api.post(
        `/user-formations/${formationId}/complete_step/`, // URL corrigée
        {
          updates,
          formation_id: formationId
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        }
      );
      // On remplace l'état local par la réponse du serveur. C'est la source de vérité !
      setTraining(updatedTraining);
    } catch (e) {
      toast.error("Erreur lors de la sauvegarde de la progression.");
      // Optionnel: Gérer le retour en arrière en cas d'erreur
    }
  };

  /* ----------------------------------------------------------- */
  /* 3. Handlers                                                  */
  /* ----------------------------------------------------------- */
  const handleTabCompletion = (tabName) => {
    // On envoie une action claire au backend
    persist({ completed_tab: tabName });

    // La navigation automatique vers l'onglet suivant reste
    const availableTabs = ["overview"];
    if (training?.modules?.length) availableTabs.push("modules");
    if (training?.ressources?.length) availableTabs.push("resources");
    if (training?.quiz) availableTabs.push("quiz");
    const idx = availableTabs.indexOf(tabName);
    if (idx !== -1 && idx < availableTabs.length - 1) {
      setTab(availableTabs[idx + 1]);
    }
  };


  const handleChapterCompletion = (moduleId) => {
    // On envoie l'ID du module complété
    persist({ completed_module_id: moduleId });

    // La navigation vers le chapitre suivant est gérée localement par ChaptersTab.
    // La navigation vers l'onglet suivant (quand tous les chapitres sont finis)
    // sera gérée par la mise à jour de l'état `training` qui vient du serveur.
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
        hasModules={(training.modules?.length ?? 0) >0}
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
