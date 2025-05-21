import React, { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Public/Navbar/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import PersonList from './pages/PersonList.jsx';
import PersonForm from './pages/PersonForm.jsx';
import HomePage from './components/Public/HomePage/HomePage';
import Apropos from './components/Public/Apropos/Apropos';
import Login from './components/Personne/Login/Login';
import Profile from './pages/Profile.jsx';

import ProjetList from './pages/Projet/ProjetList.jsx';
import ProjetForm from './pages/Projet/ProjetForm.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [navHeight, setNavHeight] = useState(0);

  // Pour éviter un rerender infini
  const handleHeightChange = useCallback((height) => {
    setNavHeight(height);
  }, []);
  return (
    <Router>
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

            <Route path="/Projets" element={<ProjetList />} />
            <Route path="/Projets/add" element={<ProjetForm />} />
            <Route path="/Projets/edit/:id" element={<ProjetForm />} />
            
          </Routes>
        </main>
        <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 2000 }} />
      </div>
    </Router>
  );
}

export default App;