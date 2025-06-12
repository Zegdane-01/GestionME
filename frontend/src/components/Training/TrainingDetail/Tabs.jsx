import styles from '../../../assets/styles/Training/TrainingDetail/Tabs.module.css';

const Tabs = ({ active, onChange, hasResources, hasQuiz, tabsCompleted }) => (
  <ul className={`nav nav-tabs ${styles.tabs}`}>
    <Tab 
      id="overview" 
      label="Vue d'ensemble" 
      active={active} 
      onChange={onChange} 
      completed={tabsCompleted.overview}
    />
    <Tab 
      id="modules" 
      label="modules" 
      active={active} 
      onChange={onChange} 
      completed={tabsCompleted.modules}
    />
    {hasResources && (
      <Tab 
        id="resources" 
        label="Ressources" 
        active={active} 
        onChange={onChange} 
        completed={tabsCompleted.resources}
      />
    )}
    {hasQuiz && (
      <Tab 
        id="quiz" 
        label="Quiz" 
        active={active} 
        onChange={onChange} 
        completed={tabsCompleted.quiz}
      />
    )}
  </ul>
);

const Tab = ({ id, label, active, onChange, completed }) => (
  <li className="nav-item flex-fill text-center">
    <button
      className={`nav-link w-100 ${active === id && 'active'}`}
      onClick={() => onChange(id)}
    >
      {label}
      {completed && <span className="ms-2 text-success">✓</span>}
    </button>
  </li>
);

export default Tabs;