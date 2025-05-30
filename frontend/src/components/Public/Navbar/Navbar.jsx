import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserRole, logout } from '../../../services/auth';
import logo from '../../../assets/images/logo.png';
import './Navbar.css';
import {API_URL_MEDIA} from '../../../api/api'

const Navbar = ({ onHeightChange }) => {
  const navRef = useRef(null);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const userMenuRef = useRef(null);

  // Effet pour vérifier l'état d'authentification et le rôle à chaque rendu
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);
      
      if (authStatus) {
        const userRole = getUserRole();
        setRole(userRole);
        
        // Récupérer les données utilisateur
        try {
          const userDataString = localStorage.getItem('userData');
          if (userDataString) {
            setUserData(JSON.parse(userDataString));
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      } else {
        setRole(null);
        setUserData(null);
      }
    };

    // Vérifier au chargement initial
    checkAuth();

    // Créer un écouteur d'événements pour détecter les changements au localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    // Ajouter l'écouteur pour les changements au localStorage
    window.addEventListener('storage', handleStorageChange);

    // Créer un événement personnalisé pour la déconnexion/connexion
    window.addEventListener('authChange', handleStorageChange);

    // Fermer le menu utilisateur quand on clique ailleurs
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effet pour notifier le parent du changement de hauteur
  useEffect(() => {
    if (navRef.current && typeof onHeightChange === 'function') {
      onHeightChange(navRef.current.offsetHeight);
    }
  }, [onHeightChange, isLoggedIn, role]); // Ajouter isLoggedIn et role comme dépendances

  const handleHover = (index) => {
    setActiveIndex(index);
  };

  // Gérer la déconnexion proprement
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    setIsLoggedIn(false);
    setRole(null);
    setShowUserMenu(false);
    navigate('/login');
  };

  // Afficher/masquer le menu utilisateur
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Récupérer les initiales de l'utilisateur pour l'avatar (si pas d'image)
  const getUserInitials = () => {
    if (!userData) return '?';
    
    // Supposons que userData a des propriétés nom et prenom
    const nom = userData.first_name || '';
    const prenom = userData.last_name || '';
    
    if (nom && prenom) {
      return `${prenom[0]}${nom[0]}`.toUpperCase();
    } else if (nom) {
      return nom[0].toUpperCase();
    } else if (prenom) {
      return prenom[0].toUpperCase();
    }
    
    return '?';
  };

  // -------------------------
  // Navbar pour les connectés
  // -------------------------
  const renderPrivateNavbar = () => (
    <nav className="cyber-nav" ref={navRef}>
      <div className="cyber-glow"></div>
      <Link to="/" className="cyber-logo">
        <img src={logo} alt="Expleo Logo" className="logo-image" />
      </Link>

      <div className="cyber-links">
        {role === 'TeamLead' && 
          [
            { path: '/collaborateurs', label: 'COLLABORATEURS' },
            { path: '/projets', label: 'PROJETS' },
            { path: '/trainings', label: 'MES FORMATIONS' },
            { path: '/manager/trainings', label: 'GERER FORMATIONS' },
          ].map(({ path, label }, index) => (
            <Link
              key={path}
              to={path}
              className={`cyber-link ${index === activeIndex ? 'active' : ''}`}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {label}
              <span className="link-underline"></span>
            </Link>
          ))
        }

        {role === 'COLLABORATEUR' && 
          [
            { path: '/', label: '' },
            { path: '/profile', label: 'PROFILE' },
            { path: '/trainings', label: 'MES FORMATIONS' }
          ].map(({ path, label }, index) => (
            <Link
              key={path}
              to={path}
              className={`cyber-link ${index === activeIndex ? 'active' : ''}`}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {label}
              <span className="link-underline"></span>
            </Link>
          ))
        }
      </div>

      <div className="user-profile-container" ref={userMenuRef}>
        <div className="user-avatar" onClick={toggleUserMenu}>
          {userData && userData.photo ? (
            <img src={`${API_URL_MEDIA}${userData.photo}`} alt="Profil" />
          ) : (
            <div className="avatar-initials">{getUserInitials()}</div>
          )}
        </div>
        
        {showUserMenu && (
          <div className="user-dropdown-menu">
            <div className="user-info">
              <div className="user-name">{userData?.first_name} {userData?.last_name}</div>
              <div className="user-role">{userData?.role}</div>
            </div>
            <ul className="menu-options">
              <li>
                <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                  Mon Profil
                </Link>
              </li>
              <li className="menu-divider"></li>
              <li>
                <a href="#" onClick={handleLogout}>
                  Déconnecter
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );

  // -----------------------
  // Navbar pour les invités
  // -----------------------
  const renderPublicNavbar = () => (
    <nav className="cyber-nav" ref={navRef}>
      <div className="cyber-glow"></div>
      <Link to="/" className="cyber-logo">
        <img src={logo} alt="Expleo Logo" className="logo-image" />
      </Link>

      <div className="cyber-links">
        {[
          { path: '/', label: 'ACCUEIL' },
          { path: '/A_Propos', label: 'A PROPOS' },
          { path: '/services', label: 'SERVICES' }
        ].map(({ path, label }, index) => (
          <Link
            key={path}
            to={path}
            className={`cyber-link ${index === activeIndex ? 'active' : ''}`}
            onMouseEnter={() => handleHover(index)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {label}
            <span className="link-underline"></span>
          </Link>
        ))}
      </div>

      <Link to="/login" className="cyber-button">
        <span className="button-pulse"></span>
        Se Connecter
      </Link>
    </nav>
  );

  // Afficher la bonne navbar selon l'état d'authentification
  return isLoggedIn ? renderPrivateNavbar() : renderPublicNavbar();
};

export default Navbar;