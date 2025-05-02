import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/logoME.svg'; // Assurez-vous que le chemin est correct
import './Navbar.css'; // 
const Navbar = () => {
  const navRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleHover = (index, e) => {
    const link = e.target;
    const navRect = navRef.current.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    
    setActiveIndex(index);
  };

  return (
    <nav className="cyber-nav" ref={navRef}>
      <div className="cyber-glow"></div>
      <Link to="/" className="cyber-logo">
            <img 
                src={logo} 
                alt="Expleo Logo" 
                className="logo-image"
            />
        </Link>

      <div className="cyber-links">
        {['/', '/A_Propos', '/services'].map((path, index) => (
          <Link
            key={path}
            to={path}
            className={`cyber-link ${index === activeIndex ? 'active' : ''}`}
            onMouseEnter={(e) => handleHover(index, e)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {['ACCUEIL', 'A PROPOS', 'SERVICES'][index]}
            <span className="link-underline"></span>
          </Link>
        ))}
      </div>

      <Link to="api/personne/login" className="cyber-button">
        <span className="button-pulse"></span>
        Se Connecter
      </Link>
    </nav>
  );
};

export default Navbar;