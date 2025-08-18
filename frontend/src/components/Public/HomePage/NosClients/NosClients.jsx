import React from 'react';
import './NosClients.css'; 

const clients = [
  { id: 1, name: 'STELLANTIS', logo: require('../../../../assets/images/NosClients/Stellantis.png') },
  { id: 2, name: 'Airbus', logo: require('../../../../assets/images/NosClients/Airbus-Logo.png')},
  { id: 3, name: 'Continental', logo: require('../../../../assets/images/NosClients/continental.png') },
  { id: 4, name: 'NHS', logo: require('../../../../assets/images/NosClients/Dacia-Logo.png')},
  { id: 5, name: 'Primark', logo: require('../../../../assets/images/NosClients/nissan-logo.png')},
  { id: 6, name: 'renault', logo: require('../../../../assets/images/NosClients/renault-logo.png')},
  { id: 7, name: 'Thales', logo: require('../../../../assets/images/NosClients/Bosch-logo.png')},
  { id: 8, name: 'Thales', logo: require('../../../../assets/images/NosClients/punch-powertrain.png')},
  { id: 9, name: 'Thales', logo: require('../../../../assets/images/NosClients/vitesco_t.jpg')},
  { id: 10, name: 'Thales', logo: require('../../../../assets/images/NosClients/Logo_de_Daher.png')},
  { id: 11, name: 'Thales', logo: require('../../../../assets/images/NosClients/Valeo_Logo.png')},
  { id: 12, name: 'Thales', logo: require('../../../../assets/images/NosClients/treves.png')},
  { id: 13, name: 'Thales', logo: require('../../../../assets/images/NosClients/Logo_CAF.png')},
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
