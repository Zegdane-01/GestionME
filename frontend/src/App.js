import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { isTokenExpired, logout } from './services/auth';

import { Toaster } from 'react-hot-toast';

import Navbar from './components/Public/Navbar/Navbar.jsx';
import HomePage from './components/Public/HomePage/HomePage';
import Apropos from './components/Public/Apropos/Apropos';

import Login from './components/Personne/Login/Login';

import PersonList from './pages/PersonList.jsx';
import PersonForm from './pages/PersonForm.jsx';
import Profile from './pages/Profile.jsx';
import Hierarchie from './pages/Hierarchie/Hierarchie.jsx'

import ProjetList from './pages/Projet/ProjetList.jsx';
import ProjetForm from './pages/Projet/ProjetForm.jsx';

import TrainingList from './pages/Training/TrainingList';
import TrainingDetail from './pages/Training/TrainingDetail';

import EquipeList from './pages/Equipe/EquipeList.jsx';
import EquipeForm from './pages/Equipe/EquipeForm.jsx';

import TrainingListManager from './pages/Training/Manager/TrainingListManager.jsx';
import TrainingForm from "./pages/Training/Manager/TrainingForm.jsx";

import FormationBrowser from "./pages/Training/FormationBrowser.jsx";


import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [navHeight, setNavHeight] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ignorer les pages publiques (login, home, etc.)
    const publicRoutes = ['/', '/login', '/A_Propos'];
    if (!publicRoutes.includes(location.pathname) && isTokenExpired()) {
      logout();
      navigate('/login');
    }
  }, [location.pathname, navigate]);


  // Pour éviter un rerender infini
  const handleHeightChange = useCallback((height) => {
    setNavHeight(height);
  }, []);
  return (
      <div className="App">
        <Navbar onHeightChange={handleHeightChange}/>
        <main style={{ paddingTop: `${navHeight}px` }}>
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
            <Route path="/hierarchie" element={<Hierarchie />} />

            <Route path="/Projets" element={<ProjetList />} />
            <Route path="/Projets/add" element={<ProjetForm />} />
            <Route path="/Projets/edit/:id" element={<ProjetForm />} />

            <Route path="/trainings" element={<TrainingList />} />
            <Route path="/trainings/:id" element={<TrainingDetail />} />

            <Route path="/equipes" element={<EquipeList />} />
            <Route path="/equipes/add" element={<EquipeForm />} />
            <Route path="/equipes/edit/:id" element={<EquipeForm />} />


            <Route path="/manager/trainings" element={<TrainingListManager />} />
            <Route path="/manager/trainings/add" element={<TrainingForm />} />
            <Route path="/manager/trainings/edit/:id" element={<TrainingForm />} />

            <Route path="/formations" element={<FormationBrowser />} />

            {/* Routes protégées */}
            
          </Routes>
        </main>
        <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 2000 }} />
      </div>
  );
}

export default App;