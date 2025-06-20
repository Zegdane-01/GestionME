import styles from '../../../assets/styles/Training/TrainingDetail/Tabs.module.css';
import { CheckCircle, Lock } from 'lucide-react';

const Tabs = ({ active, onChange, hasModules, hasResources, hasQuiz, tabsCompleted }) => {

  const availableTabs = [
    { key: 'overview', label: "Vue d'ensemble", isAvailable: true },
    { key: 'modules', label: "Modules", isAvailable: hasModules },
    { key: 'resources', label: "Supports", isAvailable: hasResources },
    { key: 'quiz', label: "Quiz", isAvailable: hasQuiz },
  ].filter(tab => tab.isAvailable); // On ne garde que les onglets qui existent pour cette formation
  return (
  <ul className={`nav nav-tabs ${styles.tabs}`}>
    {availableTabs.map((tab, index) => {
        // 2. Calculer l'accessibilité pour chaque onglet
        // L'onglet précédent doit être complété pour débloquer l'actuel.
        const previousTab = index > 0 ? availableTabs[index - 1] : null;
        const isAccessible = !previousTab || tabsCompleted[previousTab.key];

        return (
          <Tab 
            key={tab.key}
            id={tab.key} 
            label={tab.label}
            active={active} 
            onChange={onChange} 
            completed={tabsCompleted[tab.key]}
            // 3. Passer le résultat au composant enfant
            isAccessible={isAccessible}
          />
        );
      })}
  </ul>
  )
};

const Tab = ({ id, label, active, onChange, completed, isAccessible }) => (
  <li className="nav-item flex-fill text-center">
    <button
      className={`nav-link w-100 ${active === id && 'active'}`}
      onClick={() => {
        if (isAccessible) {
          onChange(id);
        }
      }}
      disabled={!isAccessible}
      title={isAccessible ? `Aller à la section : ${label}` : "Veuillez terminer l'étape précédente pour débloquer cet onglet"}

    >
      {label}&nbsp;
      <span style={{ width: '20px', height: '20px' }}>
        {isAccessible ? (
          // Si accessible et complété, on affiche la coche verte
          completed && <CheckCircle size={16} className="text-success" />
        ) : (
          // Si non accessible, on affiche le cadenas
          <Lock size={14} className="text-muted" />
        )}
      </span>
    </button>
  </li>
);

export default Tabs;