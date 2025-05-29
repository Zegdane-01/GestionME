// src/data/trainingCatalog.js
// ------------------------------------------------------------
// Catalogue statique des formations (aucune donnée liée aux
// apprenants : pas de progress, status, tabsCompleted, etc.)
// ------------------------------------------------------------

export const trainingCatalog = [
  /* 1. Introduction 5S -------------------------------------------------- */
  {
    id: 101,
    title: 'Introduction aux 5S en atelier',
    createdBy: 'ELHICHAMI Yassine',
    department: 'ME',
    intro:
      'Comprendre et appliquer la méthode 5S pour améliorer l’ordre, la propreté et la sécurité sur les postes de travail.',
    duration: 90, // minutes
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

    chapters: [
      { id: 1011, title: 'Principe des 5S', videoUrl: '/assets/videos/5s_principes.mp4', description: 'Origines et objectifs de la démarche 5S.' },
      { id: 1012, title: 'Mise en œuvre sur le terrain', videoUrl: '/assets/videos/5s_mise_en_oeuvre.mp4', description: 'Étapes pratiques pour déployer 5S dans l’atelier.' }
    ],

    resources: [
      { id: 9991, name: 'Checklist 5S.xlsx', url: '/assets/docs/sample_5S_checklist.xlsx', ext: 'xlsx' },
      { id: 9992, name: 'Exemple Ressource.pdf', url: '/assets/docs/sample_training_resource.pdf', ext: 'pdf' }
    ],

    quiz: {
      totalScore: 20,
      questions: [
        { id: 1015, text: 'Quel est le 5ᵉ “S” ?', points: 10, options: ['Sécuriser', 'Standardiser', 'Supprimer'], correctIndex: 1 },
        { id: 1016, text: 'Fréquence d’audit d’un poste 5S ?', points: 10, options: ['Chaque jour', 'Chaque semaine', 'Chaque mois'], correctIndex: 2 }
      ]
    }
  },

  /* 2. Lean Manufacturing Avancé ---------------------------------------- */
  {
    id: 102,
    title: 'Lean Manufacturing – Niveau Avancé',
    createdBy: 'EL MASBAHI Hamza',
    department: 'ME',
    intro:
      'Approfondir les outils Lean (Kaizen, VSM, SMED) pour réduire les gaspillages et accroître l’efficience.',
    duration: 180,
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

    chapters: [
      { id: 1021, title: 'Value Stream Mapping', videoUrl: '/assets/videos/vsm.mp4', description: 'Cartographier et analyser les flux de valeur.' },
      { id: 1022, title: 'SMED (Set-up rapide)', videoUrl: '/assets/videos/smed.mp4', description: 'Réduire drastiquement les temps de changement de série.' }
    ],

    resources: [
      { id: 1023, name: 'Template VSM.pptx', url: '/assets/docs/template_vsm.pptx', ext: 'ppt' }
    ],

    quiz: {
      totalScore: 20,
      questions: [
        { id: 1024, text: 'Combien d’étapes comporte un Kaizen Blitz ?', points: 10, options: ['3', '5', '7'], correctIndex: 2 },
        { id: 1025, text: 'L’outil SMED vise principalement à réduire…?', points: 10, options: ['Les rebuts', 'Les temps de changement', 'Le stock'], correctIndex: 1 }
      ]
    }
  },

  /* 3. Sécurité Machine & Ergonomie ------------------------------------- */
  {
    id: 103,
    title: 'Sécurité Machine & Ergonomie',
    createdBy: 'ZEGDANE Ahmed',
    department: 'ME',
    intro:
      'Identifier les risques machine, appliquer les normes CE et améliorer l’ergonomie des postes.',
    duration: 150,
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

    chapters: [
      { id: 1031, title: 'Analyse de risque (EN ISO 12100)', videoUrl: '/assets/videos/risque_machine.mp4', description: 'Processus d’évaluation et mesures de réduction.' },
      { id: 1032, title: 'Principes d’ergonomie', videoUrl: '/assets/videos/ergonomie.mp4', description: 'Adapter le poste à l’opérateur pour réduire la pénibilité.' }
    ],

    resources: [],

    quiz: {
      totalScore: 20,
      questions: [
        { id: 1033, text: 'Couleur qui signale un danger mécanique ?', points: 10, options: ['Vert', 'Bleu', 'Jaune'], correctIndex: 2 },
        { id: 1034, text: 'Premier réflexe pour réduire un risque ?', points: 10, options: ['ÉPI', 'Suppression à la source', 'Formation'], correctIndex: 1 }
      ]
    }
  },

  /* 4. Process FMEA ------------------------------------------------------ */
  {
    id: 104,
    title: 'Process FMEA : Méthode et Application',
    createdBy: 'ELHICHAMI Yassine',
    department: 'ME',
    intro:
      'Apprendre à construire un PFMEA pour anticiper et réduire les défaillances de process.',
    duration: 120,
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

    chapters: [
      { id: 1041, title: 'Étapes du PFMEA', videoUrl: '/assets/videos/pfmea_etapes.mp4', description: 'Structure et logigramme de l’analyse.' },
      { id: 1042, title: 'Cotations S-O-D', videoUrl: '/assets/videos/pfmea_cotation.mp4', description: 'Attribuer Sévérité, Occurrence, Détection.' }
    ],

    resources: [
      { id: 1043, name: 'Tableau PFMEA.xlsx', url: '/assets/docs/pfmea.xlsx', ext: 'xlsx' }
    ],

    quiz: {
      totalScore: 20,
      questions: [
        { id: 1044, text: 'Le RPN est le produit de… ?', points: 10, options: ['S×O', 'S×O×D', 'S×D'], correctIndex: 1 },
        { id: 1045, text: 'Une action de détection réduit principalement… ?', points: 10, options: ['Sévérité', 'Occurrence', 'Détection'], correctIndex: 2 }
      ]
    }
  },

  /* 5. Gestion des flux Kanban ------------------------------------------ */
  {
    id: 105,
    title: 'Gestion des flux Kanban',
    createdBy: 'EL MASBAHI Hamza',
    department: 'ME',
    intro:
      'Mettre en place un système Kanban pour lisser la production et réduire le WIP.',
    duration: 100,
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

    chapters: [
      { id: 1051, title: 'Principe Pull vs Push', videoUrl: '/assets/videos/pull_push.mp4', description: 'Comparer les logiques de planification.' }
    ],

    resources: [],

    quiz: {
      totalScore: 10,
      questions: [
        { id: 1052, text: 'Quel signal déclenche la production dans Kanban ?', points: 10, options: ['Commande client', 'Carte', 'Plan de production'], correctIndex: 1 },
        { id: 1053, text: 'Le WIP désigne… ?', points: 10, options: ['Stock en cours', 'Temps de cycle', 'Temps d’attente'], correctIndex: 0 }
      ]
    }
  },

  /* 6. Maintenance Autonome (TPM) ---------------------------------------- */
  {
    id: 106,
    title: 'Maintenance Autonome (TPM)',
    createdBy: 'ELHICHAMI Yassine',
    department: 'ME',
    intro:
      'Former les opérateurs à l’entretien de premier niveau pour fiabiliser les équipements.',
    duration: 110,
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

    chapters: [
      { id: 1061, title: 'Piliers du TPM', videoUrl: '/assets/videos/tpm_piliers.mp4', description: 'Les 8 piliers et leur impact sur la performance.' }
    ],

    resources: [
      { id: 1062, name: 'Checklist Daily Maintenance.pdf', url: '/assets/docs/checklist_tpm.pdf', ext: 'pdf' }
    ],

    quiz: {
      totalScore: 10,
      questions: [
        { id: 1063, text: 'Quelle est la toute première étape de la maintenance autonome ?', points: 10, options: ['Inspection', 'Nettoyage initial', 'Lubrification'], correctIndex: 1 },
        { id: 1064, text: 'Objectif principal du TPM ?', points: 10, options: ['Disponibilité 100 %', 'Zéro panne', 'Zéro défaut'], correctIndex: 1 }
      ]
    }
  }
];
