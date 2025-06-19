import React from "react";
import { Modal, Button } from "react-bootstrap";
import { Download } from "lucide-react";
import styles from '../../../assets/styles/ViewModal.module.css';

/**
 * Utilitaires simples –– copie/importe-les depuis ton fichier utils :
 */
const toAbsolute = (url) =>
  url && !url.startsWith("http") ? `${window.location.origin}${url}` : url;

const getExtensionFromUrl = (url) => {
  try {
    const decoded = decodeURIComponent(url);
    const filename = decoded.split("/").pop();
    return filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
  } catch {
    return "";
  }
};

/**
 * Petite fonction d’aperçu (tu peux la sortir dans utils si tu l’utilises ailleurs)
 */
const renderPreview = (url, ext) => {
  if (!url) return null;
  if (ext === "pdf") return <iframe src={url} title="pdf" className="w-100" style={{height: "70vh"}} />;

  const office = ["ppt","pptx","xls","xlsx","doc","docx"];
  if (office.includes(ext) && url.startsWith("https://")) {
    const viewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    return <iframe src={viewer} title="office" className="w-100" style={{height: "70vh"}} />;
  }

  const images = ["jpg","jpeg","png","gif","webp","svg"];
  if (images.includes(ext)) return <img src={url} alt="aperçu" className="img-fluid d-block mx-auto" />;

  const videos = ["mp4","webm","ogg"];
  if (videos.includes(ext))
    return (
      <video controls className="w-100">
        <source src={url} type={`video/${ext}`} />
      </video>
    );

  return <p className="text-center">Aperçu indisponible ; téléchargez le fichier.</p>;
};

const handleDownload = async (resource) => {
    try {
      const absUrl = toAbsolute(resource.file);
      
      const response = await fetch(absUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.title || resource.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur de téléchargement: ${error.message}`);
    }
  };

const ResourcePreviewModal = ({ res, onHide }) => {
  if (!res) return null;

  const absUrl = toAbsolute(res.file || res.url);
  const ext    = res.ext || getExtensionFromUrl(absUrl);

  return (
    <Modal className={styles.customModal} show onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>{res.title ?? res.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>{renderPreview(absUrl, ext)}</Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        {res.size && <span className="text-muted">{res.size}</span>}

        <Button
            className="btn btn-sm btn-dark"
            onClick={() => handleDownload(res)}
        >
            <div className="d-flex align-items-center">
            <Download size={16} className="me-1" /> &nbsp;Télécharger
            </div>
        </Button>
        <Button 
            variant="outline-secondary" 
            onClick={onHide}
            className={styles.btnClose}
        >
            Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResourcePreviewModal;
