import React from 'react';
import './HomePage.css';
import Navbar from '../Navbar/Navbar';
import Presentation from './Presentation/Presentation';
import Footer from '../Footer/Footer';

function HomePage() {
  return (
    <div className="home-page">
      <Navbar />
      <Presentation />
      <Footer />
    </div>
  );
}

export default HomePage;