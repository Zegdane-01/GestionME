// shared/ProgressBar.jsx
const ProgressBar = ({ value, success }) => (
  <div className="progress" style={{ height: 6 }}>
    <div
      className={`progress-bar ${success ? 'bg-success' : 'bg-dark'}`}
      style={{ width: `${value}%` }}
    />
  </div>
);

export default ProgressBar;