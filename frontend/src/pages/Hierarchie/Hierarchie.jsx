import React, { useEffect, useRef, useState } from 'react';
import toast from "react-hot-toast";
import OrgChart from "@balkangraph/orgchart.js";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import api, { mediaApi } from "../../api/api";
import defaultAvatar from "../../assets/images/default-avatar.png";
import styles from "../../assets/styles/Hierarchie/HierarchieTree.module.css";
import logo from '../../assets/images/Expleo_Group_Logo.png';

const HierarchieTree = () => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  const pruneIsolatedNodes = (nodes) => {
    // 1. Tous les ids jouant le rôle de parent
    const referencedAsParent = new Set(
      nodes.filter(n => n.pid !== null).map(n => n.pid)
    );

    // 2. On conserve :
    //    • les nœuds qui ont un parent (pid ≠ null)
    //    • OU les nœuds qui sont vraiment parents de quelqu’un
    return nodes.filter(
      n => n.pid !== null || referencedAsParent.has(n.id)
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get("/personne/hierarchie/");
        const allNodes     = await flattenHierarchy(data);
        const visibleNodes = pruneIsolatedNodes(allNodes);
        initChart(visibleNodes);
      } catch {
        toast.error("Erreur de chargement de la hiérarchie");
      }
    };
    loadData();
  }, []);

  const toBase64 = async (url) => {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const flattenHierarchy = async (data, parent = null, result = []) => {
    const teamsAdded = new Set();
    for (const person of data) {
      const photoUrl = person.photo
        ? `${mediaApi.defaults.baseURL}${person.photo}`
        : defaultAvatar;

      const base64Img = await toBase64(photoUrl).catch(() => defaultAvatar);
      const base64ImgEquipe = await toBase64('https://cdn-icons-png.flaticon.com/512/681/681494.png').catch(() => '');

      let personParentId = parent;
      if (person.equipes && person.equipes.length > 0) {
        const team = person.equipes[0]; // On prend la première équipe pour simplifier
        const teamId = `team-${team.name}-${parent}`; // Crée un ID unique pour l'équipe sous ce manager

        // Si l'équipe n'a pas encore été ajoutée pour ce manager, on la crée
        if (!teamsAdded.has(teamId)) {
          result.push({
            id: teamId,
            pid: parent, // L'équipe est rattachée au manager
            name: team.name,
            role: '',
            img: base64ImgEquipe, // Icône générique pour une équipe
            tags: ["team-node"], // Tag pour un style différent
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
        img: base64Img, // 🔁 ici on utilise l'image encodée
      });

      if (person.subordinates?.length) {
        await flattenHierarchy(person.subordinates, person.matricule, result);
      }
    }
    return result;
  };

  const nodeTemplate = ({ data }) => {
    return `
      <div class="${styles.organizationCardWrapper}">
        <div class="${styles.organizationCard}">
          <img src="${data.img}" class="${styles.avatar}" onerror="this.src='${defaultAvatar}'" />
          <div class="${styles.textBox}">
            <div class="${styles.name}">${data.first_name} ${data.last_name}</div>
            <div class="${styles.role}">${data.role}</div>
          </div>
        </div>
      </div>
    `;
  };

  const handleDownload = () => {
    const chartContainer = document.getElementById("chart-export-wrapper");
    if (!chartContainer) return;

    html2canvas(chartContainer, {
      useCORS: true,
      allowTaint: true,
      scale: 2
    }).then(canvas => {
      const link = document.createElement("a");
      link.download = "organigramme.png";
      link.href = canvas.toDataURL();
      link.click();
    }).catch(() => {
      toast.error("Erreur lors de l'export de l'organigramme");
    });
  };

  const handleDownloadPdf = async () => {
    const chartContainer = document.getElementById("chart-export-wrapper");
    if (!chartContainer) return;

    try {
      const canvas = await html2canvas(chartContainer, {
        useCORS: true,
        allowTaint: true,
        scale: 2
      });

      const imgData = canvas.toDataURL("image/png");

      // taille de la page A4 en pixels @96 dpi ≈ 794 x 1123
      const pdf = new jsPDF({
        orientation: "landscape",     // A4 horizontal : plus large
        unit: "pt",
        format: "a4"
      });

      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // redimensionne pour que ça rentre
      const ratio   = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgW    = canvas.width  * ratio;
      const imgH    = canvas.height * ratio;

      pdf.addImage(imgData, "PNG", (pageWidth - imgW) / 2, (pageHeight - imgH) / 2, imgW, imgH);
      pdf.save("organigramme.pdf");
    } catch (e) {
      toast.error("Erreur lors de la génération du PDF");
    }
  };


OrgChart.templates.myTemplate = Object.assign({}, OrgChart.templates.ana);
OrgChart.templates.myTemplate.size = [300, 80];

OrgChart.templates.myTemplate.defs = `
  <linearGradient id="expleoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="-30%" stop-color="#b0b1f7" />
    <stop offset="100%" stop-color="#6946c6" />
  </linearGradient>
`;

OrgChart.templates.myTemplate.node = `
  <rect x="0" y="0" height="80" width="300" fill="url(#expleoGradient)" rx="10" ry="10"></rect>
  <circle cx="40" cy="40" r="30" fill="#ffffff" stroke="#6366f1" stroke-width="2"></circle>
`;

OrgChart.templates.myTemplate.img_0 = `
  <clipPath id="{randId}">
    <circle cx="40" cy="40" r="28"></circle>
  </clipPath>
  <image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})"
         xlink:href="{val}" x="12" y="12" width="56" height="56"></image>
`;

OrgChart.templates.myTemplate.field_0 = `
  <text width="200" style="font-size: 16px;" font-weight="bold"
        fill="#ffffff" x="170" y="30" text-anchor="middle">{val}</text>
`;

OrgChart.templates.myTemplate.field_1 = `
  <text width="200" style="font-size: 13px;" fill="#ffffff"
        x="170" y="55" text-anchor="middle">{val}</text>
`;

OrgChart.templates.myTemplate.ripple = {
  radius: 20,
  color: "#5e92d1",
  rect: { x: 0, y: 0, width: 300, height: 80, rx: 10, ry: 10 }
};


  const initChart = (nodes) => {
    if (chart) chart.destroy(); // clean old chart
    const newChart = new OrgChart(chartRef.current, {
      nodes: nodes,
      layout: OrgChart.tree,
      
      nodeBinding: {
        field_0: "name",
        field_1: "role",
        img_0: "img"
      },
      template: "myTemplate",
      enableSearch: false,
      nodeMouseClick: OrgChart.action.none,
      collapse: { level: 5 },
      tags: {
        collapsible: {
          template: "ula"
        },
        "team-node": {
          template: "ana" // Utilisez un template plus simple pour les équipes
        }
      },
      nodeTemplate
    });
    setChart(newChart);
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
          style={{ width: '100%', height: '700px', background: 'transparent' }}
        />
      </section>
    </div>
  );
};

export default HierarchieTree;
