import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PersonList from './pages/PersonList.jsx';
import PersonForm from './pages/PersonForm.jsx';
import HomePage from './components/Public/HomePage/HomePage';
import Apropos from './components/Public/Apropos/Apropos';
import Login from './components/Personne/Login/Login';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/A_Propos" element={<Apropos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/personnes" element={<PersonList />} />
            <Route path="/personnes/add" element={<PersonForm />} />
            <Route path="/personnes/edit/:id" element={<PersonForm />} />
          </Routes>
        </main>
        <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 5000 }} />
      </div>
    </Router>
  );
}

export default App;