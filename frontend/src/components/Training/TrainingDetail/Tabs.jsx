// components/training/Tabs.jsx
import styles from '../../../assets/styles/Training/TrainingDetail/Tabs.module.css';

const Tabs = ({ active, onChange, hasResources, hasQuiz }) => (
  <ul className={`nav nav-tabs ${styles.tabs}`}>
    <Tab id="overview"  label="Vue d'ensemble" active={active} onChange={onChange} />
    <Tab id="chapters"  label="Chapitres"      active={active} onChange={onChange} />
    {hasResources && <Tab id="resources" label="Ressources" active={active} onChange={onChange} />}
    {hasQuiz       && <Tab id="quiz"      label="Quiz"       active={active} onChange={onChange} />}
  </ul>
);

const Tab = ({ id, label, active, onChange }) => (
  <li className="nav-item flex-fill text-center">
    <button
      className={`nav-link w-100 ${active === id && 'active'}`}
      onClick={() => onChange(id)}
    >
      {label}
    </button>
  </li>
);

export default Tabs;
