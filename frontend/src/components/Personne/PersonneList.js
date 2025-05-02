import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const PersonneList = () => {
  const [personnes, setPersonnes] = useState([]);
  
  useEffect(() => {
    const fetchPersonnes = async () => {
      try {
        const response = await api.get('personne/personne/'); // Assurez-vous que l'URL est correcte
        setPersonnes(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des personnes:', error);
      }
    };
    
    fetchPersonnes();
  }, []);
  
  return (
    <div>
      <h2>Liste des Personnes</h2>
      <Button component={Link} to="/personnes/create" variant="contained" color="primary">
        Ajouter une personne
      </Button>
      
      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matricule</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {personnes.map((personne) => (
              <TableRow key={personne.id}>
                <TableCell>{personne.matricule}</TableCell>
                <TableCell>{personne.nom}</TableCell>
                <TableCell>{personne.prenom}</TableCell>
                <TableCell>{personne.email}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/personnes/${personne.id}`} variant="outlined" color="primary">
                    Voir
                  </Button>
                  <Button component={Link} to={`/personnes/${personne.id}/edit`} variant="outlined" color="secondary" style={{ marginLeft: 10 }}>
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PersonneList;