import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PersonneList from './components/Personne/PersonneList';
import HomePage from './components/Public/HomePage/HomePage';
import Apropos from './components/Public/Apropos/Apropos';
import Login from './components/Personne/Login/Login';
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
            <Route path="/api/personne/personne" element={<PersonneList />} />
            <Route path="/A_Propos" element={<Apropos />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;