import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, InputGroup, Row, Col, Badge } from "react-bootstrap";
import { Trash, Pencil, X } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../../../api/api";
import styles from "../../../../assets/styles/ViewModal.module.css";
import DeleteDomainModal from "./DeleteDomainModal";

/**
 * Modal de gestion des domaines
 * Ajout / modification / suppression
 *  + nouveaux champs numériques sur 0‒4 :
 *      - prerequisites_level
 *      - consultant_target
 *      - leader_target
 */
const DomainManagerModal = ({ show, onHide }) => {
  /* --------------------- state --------------------- */
  const [domains, setDomains] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState(null);

  // Ajout
  const [newName, setNewName] = useState("");
  const [newPrereq, setNewPrereq] = useState(0);
  const [newConsult, setNewConsult] = useState(0);
  const [newLeader, setNewLeader] = useState(0);

  // Edition
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrereq, setEditPrereq] = useState(0);
  const [editConsult, setEditConsult] = useState(0);
  const [editLeader, setEditLeader] = useState(0);

  /* --------------------- helpers ------------------- */
  const loadDomains = async () => {
    try {
      const res = await api.get("/domains/");
      setDomains(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  /* --------------------- effects ------------------- */
  useEffect(() => { if (show) loadDomains(); }, [show]);

  /* --------------------- CRUD ---------------------- */
  const parseVal = (v) => Math.min(4, Math.max(0, parseFloat(v || 0))); // clamp 0‑4

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await api.post("/domains/", {
        name: newName,
        prerequisites_level: parseVal(newPrereq),
        consultant_target:   parseVal(newConsult),
        leader_target:       parseVal(newLeader),
      });
      toast.success("Domaine ajouté");
      setNewName(""); setNewPrereq("0"); setNewConsult("0"); setNewLeader("0");
      loadDomains();
    } catch { toast.error("Erreur d'ajout"); }
  };

  const handleSave = async () => {
    try {
      await api.put(`/domains/${editId}/`, {
        name: editName,
        prerequisites_level: parseVal(editPrereq),
        consultant_target:   parseVal(editConsult),
        leader_target:       parseVal(editLeader),
      });
      toast.success("Domaine modifié");
      setEditId(null);
      loadDomains();
    } catch { toast.error("Erreur modification"); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/domains/${id}/`);
      toast.success("Supprimé");
      loadDomains();
    } catch (e) { toast.error("Erreur suppression"); }
  };

  /* --------------------- render -------------------- */
  return (
    <Modal show={show} onHide={onHide} centered size="lg" className={styles.customModal}>
      <Modal.Header closeButton className={styles.modalHeader}><Modal.Title>Gestion des domaines</Modal.Title></Modal.Header>

      <Modal.Body className={styles.modalBody}>
        {/* Formulaire ajout */}
        <Form className="border rounded p-4 mb-4 " onSubmit={e => { e.preventDefault(); handleAdd(); }}>
          <Form.Group className="mb-2">
            <Form.Label>Ajouter un nouveau domaine</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control placeholder="Nom du nouveau domaine" value={newName} onChange={e=>setNewName(e.target.value)}/>
              
            </InputGroup>
          </Form.Group>
          <Row className="mb-3">
              <Col>
                  <Form.Group>
                      <Form.Label className='small text-muted'>Niveau Prérequis</Form.Label>
                      <Form.Control type="number" step="0.1" min={0} max={4} value={newPrereq} onChange={e=>setNewPrereq(e.target.value)}/>
                  </Form.Group>
              </Col>
              <Col>
                  <Form.Group>
                      <Form.Label className='small text-muted'>Cible Consultant</Form.Label>
                      <Form.Control type="number" step="0.1" min={0} max={4} value={newConsult} onChange={e=>setNewConsult(e.target.value)}/>
                  </Form.Group>
              </Col>
              <Col>
                  <Form.Group>
                      <Form.Label className='small text-muted'>Cible Leader</Form.Label>
                      <Form.Control type="number" step="0.1" min={0} max={4} value={newLeader} onChange={e=>setNewLeader(e.target.value)}/>
                  </Form.Group>
              </Col>
          </Row>
          <Row className="justify-content-end">
            <Button className="w-25" variant="primary" type="submit">Ajouter</Button>
          </Row>
        </Form>

        {/* Liste */}
        <ListGroup>
          {domains.map(dom => (
            <ListGroup.Item key={dom.id} className="d-flex justify-content-between align-items-center">
              {editId === dom.id ? (
                <div className="w-100">
                  <Row className="g-2 align-items-center">
                    <Col md={4}>
                      <Form.Group className="mb-0">
                        <Form.Label className="small mb-1">Domaine</Form.Label>
                        <Form.Control value={editName} onChange={e=>setEditName(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-0">
                        <Form.Label className="small mb-1">Prérequis</Form.Label>
                        <Form.Control type="number" step="0.1" min={0} max={4} value={editPrereq} onChange={e=>setEditPrereq(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-0">
                        <Form.Label className="small mb-1">Consultant.</Form.Label>
                        <Form.Control type="number" step="0.1" min={0} max={4} value={editConsult} onChange={e=>setEditConsult(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-0">
                        <Form.Label className="small mb-1">Leader</Form.Label>
                        <Form.Control type="number" step="0.1" min={0} max={4} value={editLeader} onChange={e=>setEditLeader(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex text-center gap-2 pt-4">
                      <Button size="sm" variant="success" onClick={handleSave}>Enregistrer</Button>
                      <Button className="bg-danger" size="sm" variant="outline-secondary" onClick={()=>setEditId(null)}><X size={16}/></Button>
                    </Col>
                  </Row>
                </div>
              ) : (
                <>
                  <span className="me-3 fw-medium">{dom.name}</span>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="danger">Prérequis: {Number(dom.prerequisites_level).toFixed(2)}</Badge>
                    <Badge bg="warning">Consultant: {Number(dom.consultant_target).toFixed(2)}</Badge>
                    <Badge bg="success" text="dark">Leader: {Number(dom.leader_target).toFixed(2)}</Badge>
                    <Button size="sm" variant="outline-secondary" onClick={() => { setEditId(dom.id); setEditName(dom.name); setEditPrereq(dom.prerequisites_level); setEditConsult(dom.consultant_target); setEditLeader(dom.leader_target); }}><Pencil size={16}/></Button>
                    <Button size="sm" variant="outline-danger" onClick={() => { setDomainToDelete(dom); setShowDelete(true); }}><Trash size={16}/></Button>
                  </div>
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}><Button variant="outline-secondary" onClick={onHide}>Fermer</Button></Modal.Footer>

      {/* Suppression */}
      <DeleteDomainModal
        show={showDelete}
        onHide={()=>setShowDelete(false)}
        domain={domainToDelete}
        onConfirm={(id)=>{ handleDelete(id); setShowDelete(false);} }
      />
    </Modal>
  );
};

export default DomainManagerModal;
