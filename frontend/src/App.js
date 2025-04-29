import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PersonneList from './components/Personne/PersonneList';
import HomePage from './components/Public/HomePage/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <div className="App">
        <header>
          {/* Menu de navigation */}
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/personnes" element={<PersonneList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;