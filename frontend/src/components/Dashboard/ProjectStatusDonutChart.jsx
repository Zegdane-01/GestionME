import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// On définit une carte des couleurs pour avoir un affichage cohérent
const STATUS_COLORS = {
  'In Progress': '#ecad37ff', // Bleu
  'On Hold': '#ed3636ff',     // Orange
  'Closed': '#52C41A',      // Gris
  'default': '#CBD5E0'
};

const ProjectStatusDonutChart = ({ data }) => {
  // Transformer les données : [{statut: 'In Progress', count: 15}, ...]
  const labels = data.map(item => item.statut);
  const values = data.map(item => item.count);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(label => STATUS_COLORS[label] || STATUS_COLORS.default),
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
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 20,
        },
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
        },
        formatter: (value) => (value > 0 ? value : ''), // Affiche le nombre
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export default ProjectStatusDonutChart;