import React from 'react';
import './NosClients.css'; 

const clients = [
  { id: 1, name: 'STELLANTIS', logo: require('../../../../assets/images/NosClients/Stellantis.png') },
  { id: 2, name: 'Airbus', logo: require('../../../../assets/images/NosClients/Airbus-Logo.png')},
  { id: 3, name: 'Continental', logo: require('../../../../assets/images/NosClients/continental.png') },
  { id: 4, name: 'NHS', logo: require('../../../../assets/images/NosClients/NHS_logo.png')},
  { id: 5, name: 'Primark', logo: require('../../../../assets/images/NosClients/Primark_Logo_03.2024.png')},
  { id: 6, name: 'renault', logo: require('../../../../assets/images/NosClients/renault-logo.png')},
  { id: 7, name: 'Thales', logo: require('../../../../assets/images/NosClients/Thales_Logo.png')},


  // Ajoute autant que tu veux
];
function NosClients() {
  const repeatedClients = [...clients, ...clients,];
  return (
    <section className="clients-section">
      <h2 className="text-center mb-4">Nos Clients</h2>
      <div className="clients-slider-wrapper">
        <div className="clients-slider">
          {repeatedClients.map((client, index) => (
            <div key={index} className="client-item">
              <div className="logo-box">
                <img src={client.logo} alt={client.name} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NosClients;
