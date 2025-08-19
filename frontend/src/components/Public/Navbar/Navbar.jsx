import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate,useLocation } from 'react-router-dom'; // Retrait de useLocation qui n'est plus nécessaire
import { isAuthenticated, getUserRole, logout } from '../../../services/auth';
import logo from '../../../assets/images/logo.png';
import styles from './Navbar.module.css';
import { API_URL_MEDIA } from '../../../api/api';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = ({ onHeightChange }) => {
  const navRef = useRef(null);
  const navigate = useNavigate();
   const location = useLocation();

  // State
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [role, setRole] = useState(getUserRole());
  const [userData, setUserData] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const userMenuRef = useRef(null);

  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Configuration centralisée des liens de navigation
  const navLinksConfig = {
    TeamLead: [
      { path: '/formations', label: 'Formations' },
      { path: '/radar', label: 'Rapports' },
      { path: '/hierarchie', label: 'Organigramme' },
      {path:'/dashboard', label: 'Tableau de board'},
      { 
        label: 'Gestion',
        sublinks: [
          { path: '/collaborateurs', label: 'Collaborateurs' },
          { path: '/projets', label: 'Projets' },
          { path: '/activites', label: 'Activités' },
          { path: '/manager/trainings', label: 'Formations' },
        ]
      },
      

    ],
    COLLABORATEUR: [
      { path: '/trainings', label: 'Formations' },
      { path: '/radar', label: 'Rapports' },
      { path: '/hierarchie', label: 'Organigramme' }

    ],
    public: [
      { path: '/', label: 'Accueil' }
    ]
  };
  useEffect(() => {
    if (navRef.current && typeof onHeightChange === 'function') {
      onHeightChange(navRef.current.offsetHeight);
    }
  }, [onHeightChange, isLoggedIn, role]);

  // Effet pour gérer l'authentification et les données utilisateur
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);
      if (authStatus) {
        setRole(getUserRole());
        try {
          const userDataString = localStorage.getItem('userData');
          if (userDataString) setUserData(JSON.parse(userDataString));
        } catch (error) {
          console.error('Erreur récupération données utilisateur:', error);
        }
      } else {
        setRole(null);
        setUserData(null);
      }
    };
    checkAuth();

    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);
  
  // Effet pour fermer le menu utilisateur en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Logique pour le menu utilisateur
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }

      // Logique pour le menu déroulant "Gestion"
      if (openDropdown && !event.target.closest(`.${styles.dropdown}`)) {
        setOpenDropdown(null);
      }

      // Se ferme si le clic n'est NI sur le bouton hamburger, NI dans le menu lui-même
      if (
        isMobileMenuOpen &&
        hamburgerRef.current && !hamburgerRef.current.contains(event.target) &&
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // Ce useEffect doit se mettre à jour si l'état des menus ouverts change
  }, [openDropdown, isMobileMenuOpen, showUserMenu]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Gérer la déconnexion
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };


  // Rendu d'un élément de navigation (lien simple ou dropdown)
  const renderNavItem = (link) => {
    if (link.sublinks) {
      const isDropdownOpen = openDropdown === link.label;
      return (

        <div 
          key={link.label} 
          className={`${styles.dropdown} ${isDropdownOpen ? styles.open : ''}`}
        >
          <a 
            className={`${styles.cyberLink} ${styles.dropdownToggle}`} 
            onClick={() => setOpenDropdown(isDropdownOpen ? null : link.label)}
          >
            {link.label} <ChevronDown size={16} />
          </a>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {link.sublinks.map(sublink => (
                <Link 
                  key={sublink.path} 
                  to={sublink.path} 
                  className={styles.dropdownItem}
                >
                  {sublink.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <Link key={link.path} to={link.path} className={styles.cyberLink}>
        {link.label}
        <span className={styles.linkUnderline}></span>
      </Link>
    );
  };
  
  const getLinksForRole = (currentRole) => {
    if (!isLoggedIn) {
      return navLinksConfig.public;
    }
    // Si le rôle est TL1 ou TL2, on retourne les liens TeamLead
    if (currentRole === 'TeamLead') {
      return navLinksConfig.TeamLead;
    }
    // Si le rôle est COLLABORATEUR, on retourne les liens correspondants
    if (currentRole === 'Collaborateur') {
      return navLinksConfig.COLLABORATEUR;
    }
    // Par défaut, on ne retourne rien pour éviter d'afficher des liens incorrects
    return [];
  };

  const linksToRender = getLinksForRole(role);

  return (
    <nav className={styles.cyberNav} ref={navRef}>
      <div className={styles.cyberGlow}></div>
      <Link to="/" className={styles.cyberLogo} >
        <img src={logo} alt="Expleo Logo" className={styles.logoImage} />
      </Link>

      <div className={`${styles.cyberLinks} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`} ref={mobileMenuRef}>
        {linksToRender.map(renderNavItem)}
      </div>

      <div className={styles.navRight}>
        {isLoggedIn ? (
          <div className={styles.userProfileContainer} ref={userMenuRef}>
            <div className={styles.userAvatar} onClick={() => setShowUserMenu(!showUserMenu)}>
              {userData?.photo ? (
                <img src={`${API_URL_MEDIA}${userData.photo}`} alt="Profil" />
              ) : (
                <div className={styles.avatarInitials}>{`${userData?.last_name?.[0] || ''}${userData?.first_name?.[0] || ''}`.toUpperCase()}</div>
              )}
            </div>
            {showUserMenu && (
              <div className={styles.userDropdownMenu}>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{`${userData?.first_name || ''} ${userData?.last_name || ''}`}</div>
                    <div className={styles.userRole}>{userData?.role || ''}</div>
                </div>

                <Link to="/profile" className={styles.dropdownItem}>Mon Profil</Link>
                <div className={styles.menuDivider}></div>
                <a href="#" onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logout}`}>Déconnexion</a>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={styles.cyberButton}>
            <span className={styles.buttonPulse}></span>
            Se Connecter
          </Link>
        )}
        
        <button className={styles.hamburgerMenu} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} ref={hamburgerRef}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;