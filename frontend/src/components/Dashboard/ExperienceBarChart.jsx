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

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels
);

const ExperienceBarChart = ({ data }) => {
  const labels = data.map(item => item.range);
  const values = data.map(item => item.count);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: '#ED8936', // Couleur Orange
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Graphique horizontal
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: {
          font: { size: 12, weight: '500' },
          color: '#333',
        },
      },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        offset: 5,
        color: '#4A5568',
        font: { weight: 'bold' },
        formatter: (value) => (value > 0 ? value : ''),
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default ExperienceBarChart;