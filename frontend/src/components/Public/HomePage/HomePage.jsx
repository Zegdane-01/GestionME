import React from 'react';
import './HomePage.css';
import Presentation from './Presentation/Presentation';
import Footer from '../Footer/Footer';

function HomePage() {
  return (
    <div className="home-page">
      <Presentation />
      <Footer />
    </div>
  );
}

export default HomePage;