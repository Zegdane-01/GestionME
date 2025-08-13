import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from './ProjectIEDonutChart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const COLOR_MAP = {
  Interne: '#2F80ED',
  Externe: '#27AE60',
  'N/A':   '#CBD5E1',
};
const FALLBACK = ['#2F80ED', '#27AE60', '#F2994A', '#EB5757'];

const ProjectIEDonutChart = ({ data }) => {
  const byIE = data?.by_i_e || {};
  const labels = Object.keys(byIE);
  const values = labels.map(l => byIE[l]);
  const total = values.reduce((a, b) => a + b, 0);

  const colors = labels.map((l, i) => COLOR_MAP[l] || FALLBACK[i % FALLBACK.length]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
        cutout: '60%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // légende HTML externe
      datalabels: {
        color: '#1f2937',
        font: { weight: 'bold', size: 12 },
        anchor: 'end',
        align: 'end',
        offset: 6,
        clip: false,
        formatter: (value) => {
          if (!value || !total) return '';
          const pct = Math.round((value / total) * 100);
          return pct ? `${pct}%` : '';
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed;
            const pct = total ? Math.round((v / total) * 100) : 0;
            return `${ctx.label}: ${v} (${pct}%)`;
          },
        },
      },
    },
  };

  // Total au centre
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw: (chart) => {
      const { ctx, chartArea: { width, height, left, top } } = chart;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#111827';
      ctx.font = '700 28px Inter, Arial, sans-serif';
      ctx.fillText(total || 0, left + width / 2, top + height / 2 - 6);
      ctx.fillStyle = '#6b7280';
      ctx.font = '500 12px Inter, Arial, sans-serif';
      ctx.fillText('Projets', left + width / 2, top + height / 2 + 18);
      ctx.restore();
    },
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.chart}>
        <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
      </div>

      <ul className={styles.legend}>
        {labels.map((label, i) => (
          <li key={label}>
            <span style={{ background: colors[i] }} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectIEDonutChart;
