import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/api";
import TrainingCard from "../../components/Training/TrainingCard";
import StatsSummary from "../../components/Training/StatsSummary";
import SearchBar from "../../components/Training/SearchBar";
import FilterSelect from "../../components/Training/FilterSelect";
import styles from "../../assets/styles/List.module.css";

/* ------------------------------------------------------------- */
/* Utilitaires                                                   */
/* ------------------------------------------------------------- */
const Loader = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.loadingSpinner} />
    <p>Chargement des données...</p>
  </div>
);

// Déterminer le statut en fonction du progrès
const statusFromProgress = (progress = 0, explicitStatus) => {
  if (explicitStatus) return explicitStatus; // l'API renvoie déjà le statut
  if (progress >= 100) return "terminee";
  if (progress > 0) return "en_cours";
  return "nouvelle";
};

/* ------------------------------------------------------------- */
/* Composant principal                                           */
/* ------------------------------------------------------------- */
const TrainingList = () => {
  /* ----------------------------------------------------------- */
  /* State                                                       */
  /* ----------------------------------------------------------- */
  const { state } = useLocation() || {};
  const { domainId, domainName } = state || {};

  const [allFormations, setAllFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Filtres locaux (recherche, catégorie, tri)
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all"); // all | nouvelle | en_cours | terminee
  const [sort, setSort] = useState("recent"); // recent | alpha

  /* ----------------------------------------------------------- */
  /* 1. Récupération des données (formations + état utilisateur) */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const [{ data: formations }, { data: userStates }] = await Promise.all([
          api.get("/formations/"),
          api.get("/user-formations/"),
        ]);

        // Indexer les états utilisateur par formation_id
        const userFormationMap = {};
        userStates.forEach((uf) => {
          userFormationMap[uf.formation_id] = uf;
        });

        // Fusionner les infos formation + état utilisateur
        const enriched = formations.map((f) => {
          const uf = userFormationMap[f.id] || {};
          const progress = uf.progress ?? 0;

          return {
            ...f,
            progress,
            userFormationId: uf.id ?? null,
            statut: statusFromProgress(progress, uf.statut),
          };
        });

        setAllFormations(enriched);
      } catch (err) {
        toast.error("Impossible de charger les formations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------------------------------------------------------- */
  /* 2. Filtrage, tri & statistiques (mémorisés)                 */
  /* ----------------------------------------------------------- */
  const { formations: visibleFormations, stats } = useMemo(() => {
    // Filtre domaine
    const byDomain = domainId
      ? allFormations.filter((f) => String(f.domain) === String(domainId))
      : allFormations;

    // Recherche + statut
    const filtered = byDomain.filter(
      (f) =>
        (f.titre?.toLowerCase().includes(search.toLowerCase()) ||
          f.description?.toLowerCase().includes(search.toLowerCase())) &&
        (category === "all" || category === f.statut)
    );

    // Tri
    const sorted = [...filtered].sort((a, b) =>
      sort === "recent"
        ? new Date(b.created_at) - new Date(a.created_at)
        : a.titre.localeCompare(b.titre)
    );

    // Stats (calculées uniquement sur la liste visible)
    const stats = sorted.reduce(
      (acc, f) => {
        acc.total += 1;
        if (f.statut === "terminee") acc.completed += 1;
        else if (f.statut === "en_cours") acc.inProgress += 1;
        else acc.new += 1;
        return acc;
      },
      { total: 0, completed: 0, inProgress: 0, new: 0 }
    );

    return { formations: sorted, stats };
  }, [allFormations, domainId, search, category, sort]);

  if (loading) return <Loader />;

  /* ----------------------------------------------------------- */
  /* 3. Rendu                                                    */
  /* ----------------------------------------------------------- */
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>
          Mes Formations
          {domainName && (
            <>
              {" - "}
              <small className="text-secondary">{domainName}</small>
            </>
          )}
        </h1>
      </div>

      {/* Résumé Statistiques */}
      <StatsSummary stats={stats} />

      {/* Barre de filtres */}
      <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
        <SearchBar value={search} onChange={setSearch} />
        <FilterSelect
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "Toutes" },
            { value: "nouvelle", label: "Nouvelles" },
            { value: "en_cours", label: "En cours" },
            { value: "terminee", label: "Terminées" },
          ]}
        />
        <FilterSelect
          value={sort}
          onChange={setSort}
          options={[
            { value: "recent", label: "Plus récentes" },
            { value: "alpha", label: "A → Z" },
          ]}
        />
      </div>

      {/* Nombre de résultats */}
      <p className="mb-4">
        {visibleFormations.length} formation
        {visibleFormations.length !== 1 && "s"} trouvée
        {visibleFormations.length !== 1 && "s"}
      </p>

      {/* Liste */}
      <div className="row g-4 d-flex justify-content-center">
        {visibleFormations.map((f) => (
          <div className="col-md-3" key={f.id}>
            <TrainingCard training={f} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingList;
