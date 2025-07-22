import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPerson, faPersonDress } from '@fortawesome/free-solid-svg-icons';
import styles from '../../assets/styles/Dashboard/StatusDonutChart.module.css';

// Register Chart.js elements & plugins
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const StatusDonutChart = ({ data }) => {
  /* ----------------------------- Chart Dataset ----------------------------- */
  const chartData = {
    labels: Object.keys(data.by_status),
    datasets: [
      {
        data: Object.values(data.by_status),
        backgroundColor: ['#63B3ED', '#FC8181', '#F6E05E', '#805AD5'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
        cutout: '50%',
      },
    ],
  };

  /* ----------------------------- Chart Options ----------------------------- */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 12,
          boxWidth: 10,
        },
      },

      datalabels: {
        clip: true,
        clamp: false,
        anchor: 'center',
        align: 'center',
        offset: 1,
        clamp: true,
        color: '#ffffffff',
        font: { weight: 'bold', size: 12 },
        formatter: (value, ctx) => {
          if (value === 0) return '';
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = ((value / total) * 100).toFixed(1) + '%';
          return `${pct}`;
        },
      },
    },
  };

  /* --------------------------- Centre Text Plugin --------------------------- */
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw: (chart) => {
      const { ctx, chartArea: { width, height, top, left } } = chart;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Main number (total HC)
      ctx.fillStyle = '#2D3748';
      ctx.font = '700 42px Arial';
      ctx.fillText(data.total_headcount, left + width / 2, top + height / 2 - 8);

      // Sub‑label
      ctx.fillStyle = '#718096';
      ctx.font = '400 15px Arial';
      ctx.fillText('HC ME', left + width / 2, top + height / 2 + 24);
      ctx.restore();
    },
  };

  /* ----------------------------- Component JSX ----------------------------- */
  return (
    <div className={styles.container}> {/* NEW */}
      {/* Gender block */}
      <div className={styles.genderBlock}> {/* NEW */}
        <div className={styles.genderCard}> {/* NEW */}
          <FontAwesomeIcon icon={faPersonDress} size="lg" />
          <div className={styles.genderCount}>{data.by_sexe?.Femme || 0}</div>
          <div className={styles.genderLabel}>Femmes</div>
        </div>
        <div className={styles.genderCard}> {/* NEW */}
          <FontAwesomeIcon icon={faPerson} size="lg" />
          <div className={styles.genderCount}>{data.by_sexe?.Homme || 0}</div>
          <div className={styles.genderLabel}>Hommes</div>
        </div>
      </div>

      {/* Donut */}
      <div className={styles.chartWrapper}> 
        <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
};

export default StatusDonutChart;