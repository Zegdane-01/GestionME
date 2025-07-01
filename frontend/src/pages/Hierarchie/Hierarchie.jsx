import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import defaultAvatar from '../../assets/images/default-avatar.png';
import { mediaApi } from '../../api/api';
import api from "../../api/api";
import styles from "../../assets/styles/Hierarchie/HierarchieTree.module.css";
const CollaborateurNode = ({ personne }) => {
  /* 1. on récupère la liste des subordonnés (ou tableau vide) */
  const children = personne.subordinates ?? [];

  /* 2. on déduit les indicateurs */
  const childrenCount = children.length;     // 0, 1 ou 2
  const hasChildren  = childrenCount > 0;    // booléen

  return (
    <div className={styles.node}>
      {/* carte du collaborateur */}
      <div
        className={`${styles.card} ${hasChildren ? styles.hasChildren : ""}`}
      >
        <img
          src={personne.photo ? `${mediaApi.defaults.baseURL}${personne.photo}` : defaultAvatar}
          alt="Profile"
          className={styles.avatar}
          onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
          }}
        />
        <div className={styles.textBox}>
          <span className={styles.name}>
            {personne.first_name} {personne.last_name}
          </span>
          <span className={styles.role}>{personne.role}</span>
        </div>
      </div>

      {/* enfants */}
      {hasChildren && (() => {
        const allChildrenFlat = children.every(c => !c.subordinates || c.subordinates.length === 0);

        if (allChildrenFlat) {
          // Tous les subordonnés sont "feuilles" ➜ on les affiche horizontalement
          return (
            <div className={styles.horizontalGroup}>
              {children.map((sub) => (
                <CollaborateurNode key={sub.matricule} personne={sub} />
              ))}
            </div>
          );
        } else {
          // Certains enfants ont eux-mêmes des subordonnés ➜ vertical classique
          return (
            <div className={`${styles.children} ${children.length === 1 ? styles.single : ""}`}>
              {children.map((sub) => (
                <CollaborateurNode key={sub.matricule} personne={sub} />
              ))}
            </div>
          );
        }
      })()}
    </div>
  );
};

const HierarchieTree = () => {
  const [hierarchie, setHierarchie] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/personne/hierarchie/");
        setHierarchie(data);
      } catch {
        toast.error("Erreur de chargement de la hiérarchie");
      }
    })();
  }, []);

  return (
    <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Organisation Chart</h1>
        </div>
    <section className={styles.wrapper}>

      {/* Racines */}
      <div className={styles.scrollWrapper}>
        <div className={styles.roots}>
          {hierarchie.map((p) => (
            <CollaborateurNode key={p.matricule} personne={p} />
          ))}
        </div>
      </div>
    </section>
    </div>
  );
};

export default HierarchieTree;
