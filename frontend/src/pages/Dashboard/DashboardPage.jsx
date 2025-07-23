import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';
import StatusDonutChart from '../../components/Dashboard/StatusDonutChart'; 
import ProfileHorizontalBarChart from '../../components/Dashboard/ProfileHorizontalBarChart';
import HeadcountByClientPieChart from '../../components/Dashboard/HeadcountByClientPieChart';
import PositionBarChart from '../../components/Dashboard/PositionBarChart';
import ExperienceBarChart from '../../components/Dashboard/ExperienceBarChart';
import DiplomaDonutChart from '../../components/Dashboard/DiplomaDonutChart';
import ProjectStatusDonutChart from '../../components/Dashboard/ProjectStatusDonutChart';
import UpcomingDeadlinesList from '../../components/Dashboard/UpcomingDeadlinesList';
import styles from '../../assets/styles/Dashboard/DashboardCharts.module.css';

const Loader = () => <div>Chargement du tableau de bord...</div>;

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/personne/stats/'); // Appel à notre nouvel endpoint
        setDashboardData(response.data);
      } catch (error) {
        toast.error("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }
  
  if (!dashboardData) {
    return <div>Aucune donnée à afficher.</div>;
  }

  return (
    
    <div className="container-fluid p-4">
        
      <h1 className="h3 mb-4">Tableau de Bord - HR Global</h1>
      <div className="row">
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header">Statut des collaborateurs</div>
                <div className="card-body">
                    {/* {dashboardData.collaborator_stats && (
                        <div className={styles.chartCardBody}>
                        <StatusDonutChart data={dashboardData.collaborator_stats}/>
                        </div>
                    )} */}
                </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-7 mb-4">
           <div className="card shadow h-100">
            <div className="card-header">Répartition par type de profils</div>
            <div className="card-body">
                {dashboardData.profile_distribution && (
                    <div className={styles.chartCardBody}>
                    <ProfileHorizontalBarChart data={dashboardData.profile_distribution}/>
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-7 mb-4">
           <div className="card shadow h-100">
            <div className="card-header">Headcount par Client</div>
            <div className="card-body">
                {/* {dashboardData.headcount_by_client && (
                  <div className={styles.chartCardBody}>
                    <HeadcountByClientPieChart data={dashboardData.headcount_by_client} />
                  </div>
                )} */}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header">Répartition par Position</div>
                <div className="card-body">
                  {/* {dashboardData.headcount_by_position && (
                    <div className={styles.chartCardBody}>
                      <PositionBarChart data={dashboardData.headcount_by_position} />
                    </div>
                  )} */}
                </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header">Répartition par Niveau d'Expérience</div>
                <div className="card-body">
                  {/* {dashboardData.experience_distribution && (
                    <div className={styles.chartCardBody}>
                      <ExperienceBarChart data={dashboardData.experience_distribution} />
                    </div>
                  )} */}
                </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header">Répartition par Niveau de Diplôme</div>
                <div className="card-body">
                  {/* {dashboardData.diploma_distribution && (
                    <div className={styles.chartCardBody}>
                      <DiplomaDonutChart data={dashboardData.diploma_distribution} />
                    </div>
                  )} */}
                </div>
          </div>
        </div>
      </div>
            <div className="row">
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header">Statut des Projets</div>
                <div className="card-body">
                  {/* {dashboardData.project_status_distribution  && (
                    <div className={styles.chartCardBody}>
                      <ProjectStatusDonutChart data={dashboardData.project_status_distribution} />
                    </div>
                  )}  */}
                </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header">Formations avec Échéance Proche</div>
                <div className="card-body">
                  {dashboardData.upcoming_deadlines  && (
                    <div className={styles.chartCardBody}>
                      <UpcomingDeadlinesList data={dashboardData.upcoming_deadlines} />
                    </div>
                  )}
                </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header">Répartition par Niveau de Diplôme</div>
                <div className="card-body">
                  {dashboardData.diploma_distribution && (
                    <div className={styles.chartCardBody}>
                      
                    </div>
                  )}
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;