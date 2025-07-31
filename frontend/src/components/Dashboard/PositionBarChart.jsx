import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from '../../assets/styles/Dashboard/Chart.module.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartDataLabels
);

const PositionBarChart = ({ data }) => {
  // On filtre les positions qui ont un compte de zéro pour ne pas surcharger le graphique
  const filteredData = data.filter(item => item.count > 0);

  const labels = filteredData.map(item => item.position);
  const values = filteredData.map(item => item.count);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: '#6B46C1', // Une couleur violette comme dans l'image
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Rendre le graphique horizontal
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false, // Cacher les lignes de la grille
          drawBorder: false,
        },
        ticks: {
          display: false, // Cacher les valeurs de l'axe X
        },
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#4A5568',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      // Afficher les valeurs numériques directement sur les barres
      datalabels: {
        anchor: 'end',
        align: 'end',
        offset: -25,
        color: 'white',
        font: {
          weight: 'bold',
        },
        formatter: (value) => (value > 0 ? value : ''),
      },
    },
  };
  return (
    <div className={styles.chartWrapper}> 
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PositionBarChart;