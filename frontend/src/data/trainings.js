// src/data/trainings.js

// Au lieu d'exporter directement le tableau, on va gérer son chargement/sauvegarde
const LOCAL_STORAGE_KEY = 'trainingsProgress';

// Fonction pour charger les formations depuis le localStorage ou utiliser les données initiales
const loadTrainings = () => {
  const savedTrainings = localStorage.getItem(LOCAL_STORAGE_KEY);
  return savedTrainings ? JSON.parse(savedTrainings) : [
    
 {
      id: 100,
      title: 'Conduite d\'affaires AUT',
      createdBy: 'EL MASBAHI Hamza',
      department: 'ME',
      intro:
        'Pilotage d\'affaires des projets dans le périmètre des Automatismes ',
      duration: 90,
      cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

      chapters: [
        { id: 1011, title: 'Business Conduct (phases 1-7)', videoUrl: '/assets/videos/Business_Conduct.mp4',      description: 'Processus pilotage d\'affaires des projets dans le périmètre des Automatismes',                     completed: false },
    
      ],

      resources: [
        { id: 9991, name: 'Présentation détaillée sur l\'activité AUT 1.7.pdf', url: '/assets/docs/Présentation détaillée sur l\'activité AUT 1.7.pdf', ext: 'pdf', read: false },
        { id: 9992, name: 'Processus pilotage d\'affaires des projets dans le périmètre des Automatismes - V1.6.pdf', url: '/assets/docs/Processus pilotage d\'affaires des projets dans le périmètre des Automatismes - V1.6 (1).pdf', ext: 'pdf', read: false }
],

      quiz: {
        totalScore: 4,
        completed:  false,
        questions: [
          { id: 1015, text: 'Conduite d’affaires-Qu’est-ce que la conduite d’affaire dans un contexte industriel ?',                             points:1, options:['Une méthode de recrutement de techniciens','Une technique de négociation commerciale','L’organisation et le pilotage d’un projet client, de l’étude à la réalisation','La maintenance après-vente d’une machine'],                   correctIndex:2 },
          { id: 1016, text: 'Conduite d’affaires-Quelle est la première étape d’une affaire industrielle réussie ?',                 points:1, options:['Le paiement d’un acompte','La planification des livraisons','L’analyse et la formalisation du besoin du client','Le montage sur site'],           correctIndex:2 },
          { id: 1017, text: 'Conduite d’affaires-Que contient typiquement la phase de réalisation dans une conduite d’affaire ?',                 points:1, options:['L’étude technique, les achats, la fabrication et l\'installation','La communication marketing','Le contrôle qualité uniquement','La formation des équipes commerciales'],           correctIndex:0 },
          { id: 1018, text: 'Conduite d’affaires-Qu’est-ce que la réception dans le cadre d’une affaire ?',                 points:1, options:['L\'arrivée des pièces en stock','La validation officielle par le client que la solution livrée est conforme','Le début de l’étude technique','Le moment où le client signe le contrat'],           correctIndex:1 }

        ]
      },

      progress: 0,
      status: 'new',
      tabsCompleted: { overview:false, chapters:false, resources:false, quiz:false }
    },

    /* 1. Introduction 5S -------------------------------------------------- */
    {
      id: 101,
      title: 'Introduction aux 5S en atelier',
      createdBy: 'ELHICHAMI Yassine',
      department: 'ME',
      intro:
        'Comprendre et appliquer la méthode 5S pour améliorer l’ordre, la propreté et la sécurité sur les postes de travail.',
      duration: 90,
      cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

      chapters: [
        { id: 1011, title: 'Principe des 5S',           videoUrl: 'https://ardianet.sharepoint.com/:v:/r/sites/Group_EquipeAUTMaroc/Documents%20partages/General/02%20Resource%20management/03-Catalogue%20de%20formation/26%20Cybers%C3%A9curit%C3%A9%20en%20Automatismes/Cybersecurity_20240621_153549%20(1).mp4?csf=1&web=1&e=ybiZDt',      description: 'Origines et objectifs de la démarche 5S.',                     completed: false },
        { id: 1012, title: 'Mise en œuvre sur le terrain', videoUrl: 'https://ardianet.sharepoint.com/:v:/r/sites/Group_EquipeAUTMaroc/Documents%20partages/General/02%20Resource%20management/03-Catalogue%20de%20formation/26%20Cybers%C3%A9curit%C3%A9%20en%20Automatismes/Cybersecurity_20240621_153549%20(1).mp4?csf=1&web=1&e=ybiZDt', description: 'Étapes pratiques pour déployer 5S dans l’atelier.',       completed: false }
      ],

      resources: [
        { id: 9991, name: 'Checklist 5S.xlsx', url: '/assets/docs/sample_5S_checklist.xlsx', ext: 'xlsx', read: false },
        { id: 9992, name: 'Exemple Ressource.pdf', url: '/assets/docs/sample_training_resource.pdf', ext: 'pdf', read: false }
      ],

      quiz: {
        totalScore: 20,
        completed:  false,
        questions: [
          { id: 1015, text: 'Quel est le 5ᵉ “S” ?',                             points:10, options:['Sécuriser','Standardiser','Supprimer'],                   correctIndex:1 },
          { id: 1016, text: 'Fréquence d’audit d’un poste 5S ?',                 points:10, options:['Chaque jour','Chaque semaine','Chaque mois'],           correctIndex:2 }
        ]
      },

      progress: 0,
      status: 'new',
      tabsCompleted: { overview:false, chapters:false, resources:false, quiz:false }
    },

    /* 2. Lean Manufacturing Avancé ---------------------------------------- */
    {
      id: 102,
      title: 'Cahiers de charge (CdC)',
      createdBy: 'EL MASBAHI Hamza',
      department: 'ME',
      intro:
        'édaction du cahier des charges d’Automatismes ',
      duration: 180,
      cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

      chapters: [
        { id:1021, title:'Value Stream Mapping', videoUrl:'/assets/videos/vsm.mp4',  description:'Cartographier et analyser les flux de valeur.',             completed:false },
        { id:1022, title:'SMED (Set-up rapide)',  videoUrl:'/assets/videos/smed.mp4', description:'Réduire drastiquement les temps de changement de série.', completed:false }
      ],

      resources: [
        { id:1023, name:'Template VSM.pptx', url:'/assets/docs/template_vsm.pptx', ext:'ppt', read:false }
      ],

      quiz: {
        totalScore: 20,
        completed:  false,
        questions: [
          { id:1024, text:'Combien d’étapes comporte un Kaizen Blitz ?',           points:10, options:['3','5','7'], correctIndex:2 },
          { id:1025, text:'L’outil SMED vise principalement à réduire…?',             points:10, options:['Les rebuts','Les temps de changement','Le stock'], correctIndex:1 }
        ]
      },

      progress: 0,
      status: 'new',
      tabsCompleted: { overview:false, chapters:false, resources:false, quiz:false }
    },

    /* 3. Sécurité Machine & Ergonomie ------------------------------------- */
    {
      id: 103,
      title: 'Analyse offre fournisseur (ATE)',
      createdBy: 'ZEGDANE Ahmed',
      department: 'ME',
      intro:
        'Analyse offre fournisseur (ATE)',
      duration: 150,
      cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

      chapters: [
        { id:1031, title:'Analyse de risque (EN ISO 12100)', videoUrl:'/assets/videos/risque_machine.mp4', description:'Processus d’évaluation et mesures de réduction.', completed:false },
        { id:1032, title:'Principes d’ergonomie',           videoUrl:'/assets/videos/ergonomie.mp4',      description:'Adapter le poste à l’opérateur pour réduire la pénibilité.', completed:false }
      ],

      resources: [],

      quiz: {
        totalScore: 20,
        completed:  false,
        questions: [
          { id:1033, text:'Couleur qui signale un danger mécanique ?',             points:10, options:['Vert','Bleu','Jaune'],             correctIndex:2 },
          { id:1034, text:'Premier réflexe pour réduire un risque ?',             points:10, options:['ÉPI','Suppression à la source','Formation'], correctIndex:1 }
        ]
      },

      progress: 0,
      status: 'new',
      tabsCompleted: { overview:false, chapters:false, resources:false, quiz:false }
    },

    /* 4. Process FMEA ------------------------------------------------------ */
    {
      id: 104,
      title: 'Phases Etudes & Réalisation',
      createdBy: 'ELHICHAMI Yassine',
      department: 'ME',
      intro:
        'Phases Etudes & Réalisation Study Phases & Realization Phases',
      duration: 120,
      cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

      chapters: [
        { id:1041, title:'Étapes du PFMEA',      videoUrl:'/assets/videos/pfmea_etapes.mp4',    description:'Structure et logigramme de l’analyse.', completed:false },
        { id:1042, title:'Cotations S-O-D',      videoUrl:'/assets/videos/pfmea_cotation.mp4', description:'Attribuer Sévérité, Occurrence, Détection.', completed:false }
      ],

      resources: [
        { id:1043, name:'Tableau PFMEA.xlsx', url:'/assets/docs/pfmea.xlsx', ext:'xlsx', read:false }
      ],

      quiz: {
        totalScore: 20,
        completed:  false,
        questions: [
          { id:1044, text:'Le RPN est le produit de… ?',                             points:10, options:['S×O','S×O×D','S×D'], correctIndex:1 },
          { id:1045, text:'Une action de détection réduit principalement… ?',     points:10, options:['Sévérité','Occurrence','Détection'], correctIndex:2 }
        ]
      },

      progress: 0,
      status: 'new',
      tabsCompleted: { overview:false, chapters:false, resources:false, quiz:false }
    },

    /* 5. Gestion des flux Kanban ------------------------------------------ */
    {
      id: 105,
      title: 'Controle programme automate Etats des lieux',
      createdBy: 'EL MASBAHI Hamza',
      department: 'ME',
      intro:
        'PLC program verification Inventory control',
      duration: 100,
      cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',

      chapters: [
        { id:1051, title:'Principe Pull vs Push', videoUrl:'/assets/videos/pull_push.mp4', description:'Comparer les logiques de planification.', completed:false }
      ],

      resources: [],

      quiz: {
        totalScore: 10,
        completed:  false,
        questions: [
          { id:1052, text:'Quel signal déclenche la production dans Kanban ?',   points:10, options:['Commande client','Carte','Plan de production'], correctIndex:1 },
          { id:1053, text:'Le WIP désigne… ?',                                     points:10, options:['Stock en cours','Temps de cycle','Temps d’attente'], correctIndex:0 }
        ]
      },

      progress: 0,
      status: 'new',
      tabsCompleted: { overview:false, chapters:false, resources:false, quiz:false }
    },
  ];
};

export let trainings = loadTrainings();

// Fonction utilitaire pour calculer la progression
export const calculateProgress = (training) => {
  const tabs = ['overview', 'chapters', 'resources', 'quiz'];
  let availableTabs = 1; // overview toujours présent

  if (training.chapters.length > 0) availableTabs++;
  if (training.resources.length > 0) availableTabs++;
  if (training.quiz) availableTabs++;

  const completedTabs = tabs.filter(tab => {
    if (tab === 'overview') return training.tabsCompleted.overview;
    if (tab === 'chapters') return training.chapters.length > 0 && training.tabsCompleted.chapters;
    if (tab === 'resources') return training.resources.length > 0 && training.tabsCompleted.resources;
    if (tab === 'quiz') return training.quiz && training.tabsCompleted.quiz;
    return false;
  }).length;

  return Math.round((completedTabs / availableTabs) * 100);
};

// Fonction pour mettre à jour l'état d'une formation
export const updateTrainingProgress = (trainingId, updates) => {
  const trainingIndex = trainings.findIndex(t => t.id === trainingId);
  if (trainingIndex !== -1) {
    trainings[trainingIndex] = { ...trainings[trainingIndex], ...updates };
    trainings[trainingIndex].progress = calculateProgress(trainings[trainingIndex]);

    // Mise à jour du statut
    if (trainings[trainingIndex].progress === 100) {
      trainings[trainingIndex].status = 'completed';
    } else if (trainings[trainingIndex].progress > 0) {
      trainings[trainingIndex].status = 'in_progress';
    }

    // Sauvegarder les données mises à jour dans le localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trainings));
  }
};