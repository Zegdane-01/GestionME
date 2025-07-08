// src/components/FormationProgressPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../../assets/styles/Training/TrainingProgress.module.css';
import api from '../../../api/api';

import { Train } from 'lucide-react';

// Une icône simple pour les coches et les horloges (vous pouvez utiliser une bibliothèque comme react-icons)
const Icon = ({ name }) => {
    if (name === 'check') return <span className="icon-check">✓</span>;
    if (name === 'clock') return <span className="icon-clock">🕒</span>;
    if (name === 'wrong') return <span className="icon-wrong">✗</span>;
    return null;
};

// --- Sous-composants pour chaque section ---
const ProgressHeader = ({ data }) => (
    <div className={styles.progressCards}>
        <div className={styles.card}>
            <span className={styles.cardTitle}>Progression générale</span>
            <span className={styles.cardValueLarge}>{data.progression_generale}%</span>
            <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${data.progression_generale}%` }}></div>
            </div>
        </div>
        <div className={styles.card}>
            <span className={styles.cardTitle}>Chapitres terminés</span>
            <span className={styles.cardValueLarge}>{data.chapitres_termines.completed}/{data.chapitres_termines.total}</span>
            <span className={styles.cardSubtitle}>chapitres</span>
        </div>
        <div className={styles.card}>
            <span className={styles.cardTitle}>Temps passé</span>
            <span className={styles.cardValueLarge}>{data.temps_passe_minutes}</span>
            <span className={styles.cardSubtitle}>minutes</span>
        </div>
        <div className={styles.card}>
            <span className={styles.cardTitle}>Dernier accès</span>
            <span className={styles.cardValueLarge}>{data.dernier_acces}</span>
            <span className={styles.cardSubtitle}></span>
        </div>
    </div>
);

const ChapterList = ({ chapters }) => (
    <div className={styles.chapterSection}>
        <h2><span role="img" aria-label="chart">📊</span> Progression par chapitre</h2>
        <ul className={styles.chapterList}>
            {chapters.map((chapter, index) => (
                <li key={chapter.id} className={styles.chapterItem}>
                    <div className={styles.chapterInfo}>
                        <span className={`${styles.chapterNumber} ${chapter.status === 'Terminé' ? styles.completed : ''}`}>{index + 1}</span>
                        <div>
                            <p className={styles.chapterTitle}>{chapter.titre}</p>
                            <p className={styles.chapterDescription}>{chapter.description}</p>
                        </div>
                    </div>
                    <div className={styles.chapterStatus}>
                        <Icon name="clock" /> {chapter.estimated_time_min} min
                        <span className={`${styles.statusBadge} ${chapter.status === 'Terminé' ? styles.statusCompleted : styles.statusTodo}`}>
                            {chapter.status === 'Terminé' ? <><Icon name="check"/> Terminé</> : 'À faire'}
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

const QuizResults = ({ quiz }) => {
    if (!quiz) return null;
    
    const isSuccess = quiz.score_final.percentage >= 80;

    return (
        <div className={styles.quizSection}>
            <h2><span role="img" aria-label="medal">🏆</span> Résultats du Quiz</h2>
            <p className={styles.quizSubtitle}>Quiz terminé le {quiz.quiz_termine_le}</p>
            
            <div className={styles.quizSummaryCard}>
                <div>
                    <p className={styles.finalScoreTitle}>Score final</p>
                    <p className={styles.quizTime}>Temps passé: {quiz.temps_passe_minutes} minutes</p>
                </div>
                <div className={styles.scoreDisplay}>
                    <p className={styles.scoreValue}>{quiz.score_final.score}/{quiz.score_final.total}</p>
                    <span className={`${styles.resultBadge} ${isSuccess ? styles.resultSuccess : styles.resultFail}`}>
                        {quiz.score_final.percentage}% - {isSuccess ? 'Réussi' : 'Échoué'}
                    </span>
                </div>
            </div>

            <h3>Détail des réponses</h3>
            <div className={styles.answersList}>
                {quiz.detail_des_reponses.map((answer, index) => {
                    const isCorrect = answer.points_awarded > 0;
                    const yourResponse = Array.isArray(answer.user_response) ? answer.user_response.join(', ') : answer.user_response;
                    const correctResponse = Array.isArray(answer.correct_response) ? answer.correct_response.join(', ') : answer.correct_response;

                    return (
                        <div key={answer.id} className={styles.answerItem}>
                           <div className={styles.answerHeader}>
                                <p>Question {index + 1}: {answer.texte}</p>
                                <span className={styles.points}>{isCorrect ? <Icon name="check"/> : <Icon name="wrong"/>} {answer.points_awarded} pts</span>
                           </div>
                           <p className={styles.yourResponse}>Votre réponse: {yourResponse}</p>
                           {!isCorrect && <p className={styles.correctResponse}>Bonne réponse: {correctResponse}</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Composant Principal ---

const TrainingProgress = () => {
    const { formationId } = useParams();
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour les filtres
    const [teams, setTeams] = useState([]); // Seraient chargés depuis /api/equipes
    const [collaborators, setCollaborators] = useState([]); // Seraient chargés depuis /api/personnes
    const [filtersLoading, setFiltersLoading] = useState(true);
    
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedCollaborator, setSelectedCollaborator] = useState('');

    useEffect(() => {
        const fetchFilterOptions = async () => {
            if (!formationId) return;
            setFiltersLoading(true);
            try {
                const response = await api.get(`/formations/${formationId}/filter-options/`);
                setTeams(response.data.equipes);
                setCollaborators(response.data.collaborateurs);
            } catch (err) {
                console.error("Failed to fetch filter options:", err);
                // Optionnellement, afficher une erreur à l'utilisateur
            } finally {
                setFiltersLoading(false);
            }
        };

        fetchFilterOptions();
    }, [formationId]);

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            setError(null);
            
            let url = `/formations/${formationId}/progress/`; 
            
            // Axios handles query parameters cleanly
            const config = {
                params: {}
            };
            if (selectedTeam) config.params.equipe_id = selectedTeam;
            if (selectedCollaborator) config.params.collaborateur_id = selectedCollaborator;

            try {
                // Use .get() for GET requests. The data is in response.data
                const response = await api.get(url, config);
                
                const data = response.data; // With Axios, the JSON is already parsed in .data
                
                setProgressData(Array.isArray(data) ? data[0] : data);

            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch formation progress:", e);
            } finally {
                setLoading(false);
            }
        };

        if (formationId) {
            fetchProgress();
        }
    }, [formationId, selectedTeam, selectedCollaborator]);

    const filteredCollaborators = useMemo(() => {
        if (!selectedTeam) {
            // Si aucune équipe n'est sélectionnée, on peut choisir d'afficher tous les collaborateurs ou aucun.
            // Afficher uniquement ceux de l'équipe est plus clair.
            return [];
        }
        // N'oubliez pas de comparer les types (string vs number)
        return collaborators.filter(c => c.equipe_id === parseInt(selectedTeam, 10));
    }, [selectedTeam, collaborators]);


    // NOUVEAU : Fonction pour gérer la sélection d'une équipe
    const handleTeamChange = (e) => {
        const teamId = e.target.value;
        setSelectedTeam(teamId);

        if (teamId) {
            // Filtrer les collaborateurs pour la nouvelle équipe sélectionnée
            const membersOfSelectedTeam = collaborators.filter(c => c.equipe_id === parseInt(teamId, 10));
            
            // Si cette équipe a des membres, sélectionner automatiquement le premier
            if (membersOfSelectedTeam.length > 0) {
                setSelectedCollaborator(membersOfSelectedTeam[0].matricule);
            } else {
                // Si l'équipe est vide, désélectionner le collaborateur
                setSelectedCollaborator('');
            }
        } else {
            // Si l'utilisateur désélectionne l'équipe, on vide aussi le collaborateur
            setSelectedCollaborator('');
        }
    };


    if (loading) return <div className="loading">Chargement de la progression...</div>;
    if (error) return <div className="error">Erreur: {error}</div>;
    if (!progressData) return <div>Aucune donnée de progression à afficher.</div>;

    
    return (
        <div className={styles.progressContainer}>
            <div className={styles.pageHeader}>
                <h1>{progressData.titre}</h1>
                <div className={styles.filters}>
                    <select 
                        value={selectedTeam} 
                        onChange={handleTeamChange} // Utiliser la nouvelle fonction
                        disabled={filtersLoading}
                    >
                        <option value="">
                            {filtersLoading ? "Chargement..." : "Filtrer par équipe"}
                        </option>
                        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>

                    {/* Le select pour les collaborateurs est maintenant basé sur la liste filtrée */}
                    <select 
                        value={selectedCollaborator} 
                        onChange={(e) => setSelectedCollaborator(e.target.value)}
                        disabled={filtersLoading || !selectedTeam} // Désactivé si aucune équipe n'est choisie
                    >
                        <option value="">
                            {selectedTeam ? "Choisir un collaborateur" : "Choisir une équipe d'abord"}
                        </option>
                        {/* On mappe sur la liste filtrée */}
                        {filteredCollaborators.map(collab => <option key={collab.matricule} value={collab.matricule}>{collab.full_name}</option>)}
                    </select>
                </div>
            </div>
            
            <ProgressHeader data={progressData} />
            <ChapterList chapters={progressData.progression_par_chapitre} />
            <QuizResults quiz={progressData.resultats_du_quiz} />

            <div className={styles.pageFooter}>
                <button className={styles.continueButton}>Continuer la formation</button>
            </div>
        </div>
    );
};

export default TrainingProgress;