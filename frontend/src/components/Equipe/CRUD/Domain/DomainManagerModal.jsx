import React, { useEffect, useState } from 'react';
import api from '../../../../api/api';
import styles from '../../../../assets/styles/Modal.module.css';

const DomainManagerModal = ({ show, onClose }) => {
  const [domains, setDomains] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingDomain, setEditingDomain] = useState(null);

  useEffect(() => {
    if (show) fetchDomains();
  }, [show]);

  const fetchDomains = async () => {
    try {
      const res = await api.get('/domains/');
      setDomains(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des domaines:', err);
    }
  };

  const handleAddOrEdit = async () => {
    try {
      if (editingDomain) {
        await api.put(`/domains/${editingDomain.id}/`, { name: newName });
      } else {
        await api.post('/domains/', { name: newName });
      }
      setNewName('');
      setEditingDomain(null);
      fetchDomains();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du domaine :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await api.delete(`/domains/${id}/`);
      fetchDomains();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  return show ? (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Gestion des Domaines</h2>

        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Nom du domaine"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={handleAddOrEdit}>
            {editingDomain ? 'Modifier' : 'Ajouter'}
          </button>
        </div>

        <ul className={styles.domainList}>
          {domains.map((domain) => (
            <li key={domain.id} className={styles.domainItem}>
              {domain.name}
              <div>
                <button onClick={() => {
                  setEditingDomain(domain);
                  setNewName(domain.name);
                }}>✏️</button>
                <button onClick={() => handleDelete(domain.id)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.modalFooter}>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  ) : null;
};

export default DomainManagerModal;
