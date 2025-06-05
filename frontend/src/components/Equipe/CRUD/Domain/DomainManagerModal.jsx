import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup } from 'react-bootstrap';
import { Trash, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../api/api';
import styles from '../../../../assets/styles/ViewModal.module.css';
import DeleteDomainModal from './DeleteDomainModal';


const DomainManagerModal = ({ show, onHide }) => {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [editDomainId, setEditDomainId] = useState(null);
  const [editDomainName, setEditDomainName] = useState('');
  const [domainToDelete, setDomainToDelete]   = useState(null);   // {id, name, formation_count}
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchDomains = async () => {
    try {
      const res = await api.get('/domains/');
      setDomains(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des domaines', error);
    }
  };

  useEffect(() => {
    if (show) fetchDomains();
  }, [show]);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    try {
      await api.post('/domains/', { name: newDomain });
      setNewDomain('');
      fetchDomains();
    } catch (error) {
      console.error('Erreur ajout domaine', error);
    }
  };

  const handleUpdateDomain = async (id) => {
    if (!editDomainName.trim()) return;
    try {
      await api.put(`/domains/${id}/`, { name: editDomainName });
      setEditDomainId(null);
      setEditDomainName('');
      fetchDomains();
    } catch (error) {
      console.error('Erreur modification domaine', error);
    }
  };

  const handleDeleteDomain = async (id) => {
    try {
      await api.delete(`/domains/${id}/`);
      setDomains(prev => prev.filter(domain => domain.id !== id));
      toast.success('Domaine supprimé avec succès.');
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
      console.error(err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <Modal
      className={styles.customModal}
      show={show}
      onHide={onHide}
      centered
      size="lg"
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>Gestion des domaines</Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddDomain();
          }}
        >
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Ajouter un nouveau domaine"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            <Button variant="primary" type="submit">Ajouter</Button>
          </InputGroup>
        </Form>

        <ListGroup>
          {domains.map((domain) => (
            <ListGroup.Item key={domain.id} className="d-flex justify-content-between align-items-center">
              {editDomainId === domain.id ? (
                <>
                  <Form.Control
                    value={editDomainName}
                    onChange={(e) => setEditDomainName(e.target.value)}
                    className="me-2"
                  />
                  <Button
                    variant="success"
                    onClick={() => handleUpdateDomain(domain.id)}
                    size="sm"
                  >
                    Enregistrer
                  </Button>
                </>
              ) : (
                <>
                  <span>{domain.name}</span>
                  <div>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setEditDomainId(domain.id);
                        setEditDomainName(domain.name);
                      }}
                      className="me-2"
                      size="sm"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => {
                        setDomainToDelete(domain);
                        setShowDeleteModal(true);
                      }}
                      size="sm"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <Button variant="outline-secondary" onClick={onHide} className={styles.btnClose}>
          Fermer
        </Button>
      </Modal.Footer>
      <DeleteDomainModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        domain={domainToDelete}
        onConfirm={async (id) => {
          await handleDeleteDomain(id);  // ta fonction delete
          setShowDeleteModal(false);
        }}
      />
    </Modal>
  );
};

export default DomainManagerModal;
