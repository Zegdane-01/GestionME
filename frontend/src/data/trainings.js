// src/data/trainings.js
// ──────────────────────────────────────────────────────────────────────────────
// Jeu de données mock pour l’écran TrainingList (département ME – Expleo)

export const trainings = [
  /* ══════════════════════════════════════════════════════════════════════ 1 */
  {
    id: 101,
    title: 'Introduction aux 5S en atelier',
    createdBy: 'ELHICHAMI Yassine',            // Team Lead créateur
    department: 'ME',
    intro:
      'Comprendre et appliquer la méthode 5S pour améliorer l’ordre, la propreté et la sécurité sur les postes de travail.',
    duration: 90,               // en minutes → 1 h 30
    chapters: [
      {
        id: 1011,
        title: 'Principe des 5S',
        videoUrl: '/assets/videos/5s_principes.mp4',
        description: 'Origines et objectifs de la démarche 5S.'
      },
      {
        id: 1012,
        title: 'Mise en œuvre sur le terrain',
        videoUrl: '/assets/videos/5s_mise_en_oeuvre.mp4',
        description: 'Étapes pratiques pour déployer 5S dans l’atelier.'
      }
    ],
    resources: [
      {
        id: 1013,
        name: 'Checklist 5S.xlsx',
        url: '/assets/docs/checklist_5s.xlsx'
      },
      {
        id: 1014,
        name: 'Guide visuel 5S.pdf',
        url: '/assets/docs/guide_5s.pdf'
      }
    ],
    quiz: {
      totalScore: 20,
      questions: [
        {
          id: 1015,
          text: 'Quel est le cinquième “S” de la méthode 5S ?',
          points: 10,
          options: ['Sécuriser', 'Standardiser', 'Supprimer'],
          correctIndex: 1
        },
        {
          id: 1016,
          text: 'À quelle fréquence faut-il auditer un poste 5S ?',
          points: 10,
          options: ['Chaque jour', 'Chaque semaine', 'Chaque mois'],
          correctIndex: 2
        }
      ]
    },
    progress: 100,
    status: 'completed',         // badge verte « Terminée »
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },

  /* ══════════════════════════════════════════════════════════════════════ 2 */
  {
    id: 102,
    title: 'Lean Manufacturing – Niveau Avancé',
    createdBy: 'EL MASBAHI Hamza',
    department: 'ME',
    intro:
      'Approfondir les outils Lean (Kaizen, VSM, SMED) pour réduire les gaspillages et accroître l’efficience.',
    duration: 180,              // 3 h 00
    chapters: [
      {
        id: 1021,
        title: 'Value Stream Mapping',
        videoUrl: '/assets/videos/vsm.mp4',
        description: 'Cartographier et analyser les flux de valeur.'
      },
      {
        id: 1022,
        title: 'SMED (Changement de série rapide)',
        videoUrl: '/assets/videos/smed.mp4',
        description: 'Réduire drastiquement les temps de setup.'
      }
    ],
    resources: [
      {
        id: 1023,
        name: 'Template VSM.pptx',
        url: '/assets/docs/template_vsm.pptx'
      }
    ],
    quiz: null,                  // pas de quiz pour cette formation
    progress: 0,
    status: 'new',               // badge gris « Nouvelle »
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },

  /* ══════════════════════════════════════════════════════════════════════ 3 */
  {
    id: 103,
    title: 'Sécurité Machine & Ergonomie',
    createdBy: 'ZEGDANE Ahmed',
    department: 'ME',
    intro:
      'Identifier les risques machine, appliquer les normes CE et améliorer l’ergonomie des postes.',
    duration: 150,
    chapters: [
      {
        id: 1031,
        title: 'Analyse de risque (EN ISO 12100)',
        videoUrl: '/assets/videos/risque_machine.mp4',
        description: 'Processus d’évaluation et mesures de réduction.'
      },
      {
        id: 1032,
        title: 'Principes d’ergonomie',
        videoUrl: '/assets/videos/ergonomie.mp4',
        description: 'Adapter le poste à l’opérateur pour réduire la pénibilité.'
      }
    ],
    resources: [],
    quiz: {
      totalScore: 20,
      questions: [
        {
          id: 1033,
          text: 'Quelle couleur de balisage indique un danger mécanique ?',
          points: 10,
          options: ['Vert', 'Bleu', 'Jaune'],
          correctIndex: 2
        },
        {
          id: 1034,
          text: 'La hauteur idéale d’un plan de travail est déterminée par…',
          points: 10,
          options: ['La taille moyenne', 'La tâche réalisée', 'La norme ISO 6385'],
          correctIndex: 1
        }
      ]
    },
    progress: 45,
    status: 'in_progress',       // badge bleu « En cours »
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },

  /* ══════════════════════════════════════════════════════════════════════ 4 */
  {
    id: 104,
    title: 'Process FMEA : Méthode et Application',
    createdBy: 'ELHICHAMI Yassine',
    department: 'ME',
    intro:
      'Apprendre à construire un PFMEA pour anticiper et réduire les défaillances de process.',
    duration: 120,
    chapters: [
      {
        id: 1041,
        title: 'Étapes du PFMEA',
        videoUrl: '/assets/videos/pfmea_etapes.mp4',
        description: 'Structure et logigramme de l’analyse.'
      },
      {
        id: 1042,
        title: 'Cotations S – O – D',
        videoUrl: '/assets/videos/pfmea_cotation.mp4',
        description: 'Attribuer Sévérité, Occurrence, Détection.'
      }
    ],
    resources: [
      {
        id: 1043,
        name: 'Tableau PFMEA.xlsx',
        url: '/assets/docs/pfmea.xlsx'
      }
    ],
    quiz: null,
    progress: 0,
    status: 'new',
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },

  /* ══════════════════════════════════════════════════════════════════════ 5 */
  {
    id: 105,
    title: 'Gestion des flux Kanban',
    createdBy: 'EL MASBAHI Hamza',
    department: 'ME',
    intro:
      'Mettre en place un système Kanban pour lisser la production et réduire le WIP.',
    duration: 100,
    chapters: [
      {
        id: 1051,
        title: 'Principe Pull vs Push',
        videoUrl: '/assets/videos/pull_push.mp4',
        description: 'Comparer les logiques de planification.'
      }
    ],
    resources: [],
    quiz: null,
    progress: 0,
    status: 'new',
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  },

  /* ══════════════════════════════════════════════════════════════════════ 6 */
  {
    id: 106,
    title: 'Maintenance Autonome (TPM)',
    createdBy: 'ELHICHAMI Yassine',
    department: 'ME',
    intro:
      'Former les opérateurs à l’entretien de premier niveau pour fiabiliser les équipements.',
    duration: 110,
    chapters: [
      {
        id: 1061,
        title: 'Piliers du TPM',
        videoUrl: '/assets/videos/tpm_piliers.mp4',
        description: 'Les 8 piliers et leur impact sur la performance.'
      }
    ],
    resources: [
      {
        id: 1062,
        name: 'Checklist Daily Maintenance.pdf',
        url: '/assets/docs/checklist_tpm.pdf'
      }
    ],
    quiz: {
      totalScore: 10,
      questions: [
        {
          id: 1063,
          text: 'Quelle est la première étape de la maintenance autonome ?',
          points: 10,
          options: ['Inspection', 'Nettoyage initial', 'Lubrification'],
          correctIndex: 1
        }
      ]
    },
    progress: 0,
    status: 'new',
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
  }
];
