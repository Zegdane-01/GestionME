import React, { useEffect, useRef, useState } from 'react';
import toast from "react-hot-toast";
import OrgChart from "@balkangraph/orgchart.js";
import api, { mediaApi } from "../../api/api";
import defaultAvatar from "../../assets/images/default-avatar.png";
import styles from "../../assets/styles/Hierarchie/HierarchieTree.module.css";

const HierarchieTree = () => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get("/personne/hierarchie/");
        const nodes = flattenHierarchy(data);
        initChart(nodes);
      } catch {
        toast.error("Erreur de chargement de la hiérarchie");
      }
    };
    loadData();
  }, []);

  const flattenHierarchy = (data, parent = null, result = []) => {
    data.forEach(person => {
      result.push({
        id: person.matricule,
        pid: parent,
        name: `${person.first_name} ${person.last_name}`,
        role: person.role,
        img: person.photo ? `${mediaApi.defaults.baseURL}${person.photo}` : defaultAvatar
      });
      if (person.subordinates?.length) {
        flattenHierarchy(person.subordinates, person.matricule, result);
      }
    });
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

  const initChart = (nodes) => {
    if (chart) chart.destroy(); // clean old chart
    const newChart = new OrgChart(chartRef.current, {
      nodes: nodes,
      layout: OrgChart.mixed,
      nodeBinding: {
        field_0: "name",
        field_1: "role",
        img_0: "img"
      },
      template: "ula",
      enableSearch: false,
      nodeMouseClick: OrgChart.action.none,
      collapse: { level: 3 },
      tags: {
        collapsible: {
          template: "ula"
        }
      },
      nodeTemplate
    });
    setChart(newChart);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Organigramme ME</h1>
      </div>
      <section className={styles.wrapper}>
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
