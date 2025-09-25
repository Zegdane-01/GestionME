import React, { useEffect, useRef } from 'react';
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import * as d3 from 'd3';
import { OrgChart } from 'd3-org-chart';

import api, { mediaApi } from "../../api/api";
import defaultAvatar from "../../assets/images/default-avatar.png";
import styles from "../../assets/styles/Hierarchie/HierarchieTree.module.css";
import logo from '../../assets/images/Expleo_Group_Logo.png';

const HierarchieTree = () => {
  const chartRef = useRef(null);

  // --- Les fonctions de traitement des données sont conservées ---
  const pruneIsolatedNodes = (nodes) => {
    const referencedAsParent = new Set(
      nodes.filter(n => n.pid !== null).map(n => n.pid)
    );
    return nodes.filter(
      n => n.pid !== null || referencedAsParent.has(n.id)
    );
  };

  const toBase64 = async (url) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return defaultAvatar; // Fallback to default avatar
    }
  };
  
  const flattenHierarchy = async (data, parent = null, result = []) => {
    const teamsAdded = new Set();
    for (const person of data) {
      const photoUrl = person.photo
        ? `${mediaApi.defaults.baseURL}${person.photo}`
        : defaultAvatar;

      const base64Img = await toBase64(photoUrl);

      let personParentId = parent;
      if (person.equipes && person.equipes.length > 0) {
        const team = person.equipes[0];
        const teamId = `team-${team.name}-${parent}`;

        if (!teamsAdded.has(teamId)) {
          result.push({
            id: teamId,
            pid: parent,
            tags: ["invisible-team-node"],
          });
          teamsAdded.add(teamId);
        }
        personParentId = teamId;
      }

      result.push({
        id: person.matricule,
        pid: personParentId,
        first_name: person.first_name,
        last_name: person.last_name,
        name: `${person.first_name} ${person.last_name}`,
        role: person.role,
        img: base64Img,
      });

      if (person.subordinates?.length) {
        await flattenHierarchy(person.subordinates, person.matricule, result);
      }
    }
    return result;
  };

  // --- Initialisation du graphique avec D3 ---
  useEffect(() => {
    const loadDataAndRenderChart = async () => {
      try {
        const { data } = await api.get("/personne/hierarchie/");
        const allNodes = await flattenHierarchy(data);
        const visibleNodes = pruneIsolatedNodes(allNodes);
        
        const chartData = visibleNodes.map(node => ({ ...node, parentId: node.pid }));
        
        if (chartRef.current && chartData.length > 0) {
          
          d3.select(chartRef.current).html('');

          const chart = new OrgChart()
            // --- MODIFICATIONS DU DESIGN ---
            .nodeHeight(d => d.data.tags?.includes("invisible-team-node") ? 0 : 80)
            .nodeWidth(() => 300)
            .initialExpandLevel(7) // Pour montrer les 7 premiers niveaux par défaut
            // --- FIN DES MODIFICATIONS DU DESIGN ---
            .childrenMargin(() => 50)
            .compactMarginBetween(() => 35)
            .compactMarginPair(() => 30)
            .neighbourMargin(() => 20)
            .nodeContent((d) => {
              if (d.data.tags?.includes("invisible-team-node")) {
                return '';
              }
              
              // --- NOUVEAU TEMPLATE HTML POUR LE DESIGN DEMANDÉ ---
              return `
              <div style="font-family: 'Inter', sans-serif; width:${d.width}px; height:${d.height}px;">
                <div style="
                  width:100%;
                  height:100%;
                  background: linear-gradient(90deg, #b0b1f7, #6946c6);
                  border-radius: 10px;
                  color: white;
                  display: flex;
                  align-items: center;
                  padding: 0 12px;
                  box-sizing: border-box;
                ">
                  <div style="
                    border: 2px solid #6366f1;
                    border-radius: 50%;
                    width: 56px;
                    height: 56px;
                    flex-shrink: 0;
                    background-color: white;
                  ">
                      <img src="${d.data.img}" style="border-radius:50%; width:100%; height:100%; object-fit: cover;" onerror="this.onerror=null; this.src='${defaultAvatar}';" />
                  </div>
                  <div style="margin-left: 15px; text-align: left;">
                      <div style="font-size:16px; font-weight:bold;">${d.data.name}</div>
                      <div style="font-size:13px; margin-top:3px; opacity: 0.9;">${d.data.role}</div>
                  </div>
                </div>
              </div>
              `;
            })
            .container(chartRef.current)
            .data(chartData);

          // --- CORRECTION DU CHAÎNAGE ---
          // Il faut appeler .render() d'abord, puis les autres méthodes sur l'instance
          chart.render();
          chart.fit();
        }
      } catch (error) {
        console.error("Erreur lors du chargement ou du rendu du graphique :", error);
        toast.error("Erreur de chargement de la hiérarchie");
      }
    };

    loadDataAndRenderChart();

    return () => {
      if (chartRef.current) {
        d3.select(chartRef.current).html('');
      }
    };
  }, []);


  // --- Les fonctions d'export sont conservées ---
  const handleDownload = () => {
    const chartContainer = document.getElementById("chart-export-wrapper");
    if (!chartContainer) return;

    toast.promise(
        html2canvas(chartContainer, { useCORS: true, allowTaint: true, scale: 2 })
            .then(canvas => {
                const link = document.createElement("a");
                link.download = "organigramme.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            }),
        {
            loading: 'Export en cours...',
            success: 'Image téléchargée !',
            error: "Erreur lors de l'export de l'image",
        }
    );
  };

  const handleDownloadPdf = async () => {
    const chartContainer = document.getElementById("chart-export-wrapper");
    if (!chartContainer) return;

    const promise = async () => {
        const canvas = await html2canvas(chartContainer, { useCORS: true, allowTaint: true, scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const availableWidth = pageWidth - 2 * margin;
        const availableHeight = pageHeight - 2 * margin;
        const ratio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
        const imgW = canvas.width * ratio;
        const imgH = canvas.height * ratio;
        const x = (pageWidth - imgW) / 2;
        const y = (pageHeight - imgH) / 2;
        pdf.addImage(imgData, "PNG", x, y, imgW, imgH);
        pdf.save("organigramme.pdf");
    };

    toast.promise(promise(), {
        loading: 'Génération du PDF...',
        success: 'PDF téléchargé !',
        error: "Erreur lors de la génération du PDF",
    });
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>ME Organisation chart</h1>
        <div className='d-flex gap-3'>
          <button onClick={handleDownload} className={styles.downloadBtn}>
            <Download size={16} className="me-1" /> Image
          </button>
          <button onClick={handleDownloadPdf} className={styles.downloadBtn}>
            <Download size={16} className="me-1" /> PDF
          </button>
        </div>
      </div>
      <section id="chart-export-wrapper" className={styles.wrapper}>
        <div className={styles.exportHeader}>
          <img src={logo} alt="Logo Expleo" className={styles.logo} />
          <h2 className={styles.exportTitle}>Organigramme ME</h2>
        </div>
        <div
          id="chart"
          ref={chartRef}
          style={{ width: '100%', minHeight: '700px', backgroundColor: 'transparent' }}
        />
      </section>
    </div>
  );
};

export default HierarchieTree;