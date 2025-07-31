import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from '../../assets/styles/Dashboard/Chart.module.css';

// 1. Enregistrer les éléments et le plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // N'oubliez pas d'enregistrer le plugin de labels
);

const ProfileHorizontalBarChart = ({ data }) => {
  
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  // 2. Transformer les données de l'API
  const labels = sortedData.map(item => item.profile);
  const values = sortedData.map(item => item.count);

  // 3. Définir un ensemble de couleurs à réutiliser
  const backgroundColors = [
    '#1890FF', '#13C2C2', '#52C41A', '#FADB14', '#EC932F',
    '#F5222D', '#EB2F96', '#722ED1', '#2F54EB', '#A0D911',
  ];

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        // Appliquer les couleurs de manière cyclique
        backgroundColor: values.map((_, index) => backgroundColors[index % backgroundColors.length]),
      },
    ],
  };

  // 4. Configurer les options pour le style désiré
  const options = {
    indexAxis: 'y', // Axe horizontal
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10, // Espace pour les labels à l'intérieur
        right: 20,
      }
    },
    scales: {
      x: { // Axe des valeurs (horizontal)
        display: false, // On cache l'axe comme dans l'exemple
        beginAtZero: true,
      },
      y: { // Axe des profils (vertical)
        grid: {
          display: false, // On cache la grille verticale
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: '500',
          },
          color: '#333',
        },
      },
    },
    plugins: {
      legend: {
        display: false, 
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        offset: -25,
        color: 'white',
        font: {
          weight: 'bold',
        },
        formatter: (value) => {
          return value; // Affiche simplement la valeur numérique
        },
      },
    },
  };
  return (
    <div className={styles.chartWrapper}> 
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProfileHorizontalBarChart;