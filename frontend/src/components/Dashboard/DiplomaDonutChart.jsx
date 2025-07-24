import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from '../../assets/styles/Dashboard/Chart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const DiplomaDonutChart = ({ data }) => {
  // Transformer les données : [{diplome: 'Bac+5', count: 20}, ...]
  const labels = data.map(item => item?.diplome || 'N/A');
  const values = data.map(item => item.count);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: [ // Palette de couleurs
          '#4299E1', // Bleu
          '#48BB78', // Vert
          '#ED8936', // Orange
          '#F56565', // Rouge
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2,
        cutout: '60%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // Légende à droite pour plus de clarté
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      // Plugin pour afficher les pourcentages sur le graphique
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
        },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          if (total === 0) return '0%';
          const percentage = (value / total) * 100;
          // Ne pas afficher si la part est trop petite
          return percentage > 5 ? percentage.toFixed(0) + '%' : '';
        },
      },
    },
  };

  return (
    <div className={styles.chartWrapper}> 
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DiplomaDonutChart;