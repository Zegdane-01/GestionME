import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 1. Enregistrer les éléments nécessaires pour un Pie Chart
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const HeadcountByClientPieChart = ({ data }) => {
  // 2. Transformer les données reçues de l'API
  const labels = data.map(item => item.client);
  const values = data.map(item => item.count);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: [ // Une palette de couleurs
          '#4299E1', '#48BB78', '#F56565', '#ED8936', '#805AD5',
          '#38B2AC', '#ECC94B', '#ED64A6', '#9F7AEA', '#667EEA',
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // La légende est positionnée à gauche comme sur l'image
      legend: {
        position: 'left',
        labels: {
          boxWidth: 20,
          padding: 15,
        }
      },
      // Le plugin datalabels pour afficher les pourcentages
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
        },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          if (total === 0) return '0%';
          const percentage = (value / total) * 100;
          // On n'affiche le pourcentage que s'il est assez grand pour être lisible
          return percentage > 3 ? percentage.toFixed(0) + '%' : '';
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default HeadcountByClientPieChart;