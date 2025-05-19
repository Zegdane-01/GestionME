import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import PersonList from './pages/PersonList.jsx';
import PersonForm from './pages/PersonForm.jsx';
import HomePage from './components/Public/HomePage/HomePage';
import Apropos from './components/Public/Apropos/Apropos';
import Login from './components/Personne/Login/Login';
import Profile from './pages/Profile.jsx';
import ProjetForm from './pages/Projet/ProjetForm.jsx';
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
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }/>
            <Route path="/collaborateurs" element={<PersonList />} />
            <Route path="/collaborateurs/add" element={<PersonForm />} />
            <Route path="/collaborateurs/edit/:id" element={<PersonForm />} />

            <Route path="/Projets/add" element={<ProjetForm />} />
          </Routes>
        </main>
        <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 2000 }} />
      </div>
    </Router>
  );
}

export default App;