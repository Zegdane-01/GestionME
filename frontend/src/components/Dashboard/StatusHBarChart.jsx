import React, { useState, useEffect } from 'react';
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
import { toast } from 'react-hot-toast';
import api from '../../api/api';

// Enregistrement des modules Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Le composant reçoit maintenant la liste des années disponibles en props
const StatusHBarChart = ({ availableYears }) => {
  // --- ÉTATS INTERNES DU COMPOSANT ---
  const [chartData, setChartData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- EFFETS ---

  // 1. Premier effet : Initialiser l'année sélectionnée une seule fois
  useEffect(() => {
    if (availableYears && availableYears.length > 0) {
      setSelectedYear(availableYears[0]); // Sélectionne l'année la plus récente par défaut
    }
  }, [availableYears]); // Se déclenche uniquement si la liste des années change

  // 2. Deuxième effet : Charger les données du graphique chaque fois que l'année change
  useEffect(() => {
    // Ne rien faire si aucune année n'est sélectionnée
    if (!selectedYear) return;

    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/personne/stats/bench-prod-chart/?year=${selectedYear}`);
        setChartData(response.data);
      } catch (error) {
        toast.error(`Impossible de charger les données du plan de charge pour ${selectedYear}.`);
        setChartData({ error: "Données non disponibles" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [selectedYear]); // Se redéclenche à chaque changement d'année

  // --- OPTIONS DU GRAPHIQUE ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Nombre de collaborateurs' } },
    },
  };

  // --- RENDU ---
  return (
    <div style={{ width: '100%' }}>
      {/* Le filtre est maintenant à l'intérieur du composant */}
      <div className="mb-3" style={{ maxWidth: '200px' }}>
        <label className="form-label small text-muted">Année</label>
        <select
          className="form-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          disabled={!availableYears || availableYears.length === 0}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Affichage du chargement ou du graphique */}
      <div style={{ position: 'relative', height: '350px' }}>
        {isLoading ? (
          <p className="text-center">Chargement du graphique...</p>
        ) : chartData && !chartData.error ? (
          <Bar options={chartOptions} data={chartData} />
        ) : (
          <p className="text-center text-muted">{chartData?.error || "Aucune donnée à afficher."}</p>
        )}
      </div>
    </div>
  );
};

export default StatusHBarChart;
