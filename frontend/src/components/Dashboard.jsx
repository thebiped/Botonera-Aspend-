"use client";

import { useState } from "react";
import Biblioteca from "./Biblioteca";
import Programas from "./Programas";
import SonidosInstitucionales from "./SonidosInstitucionales";
import Usuarios from "./Usuarios";
import Sidebar from "./Sidebar";
import "../assets/dashboard.css";

function Dashboard({ user, onLogout, apiUrl }) {
  const [activeTab, setActiveTab] = useState(
    user.tipo === "productor" ? "programas" : "biblioteca"
  );

  const tabs = [
    {
      id: "biblioteca",
      label: "Biblioteca",
      roles: ["admin", "operador", "productor"],
    },
    {
      id: "programas",
      label: "Programas",
      roles: ["admin", "operador", "productor"],
    },
    {
      id: "institucionales",
      label: "Sonidos Institucionales",
      roles: ["admin", "operador"],
    },
    { id: "usuarios", label: "Usuarios", roles: ["admin"] },
  ];

  const availableTabs = tabs.filter((tab) => tab.roles.includes(user.tipo));

  return (
    <div className="dashboard-layout">
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />

      <div className="dashboard-content">
        

        <div className="content-area">
          {activeTab === "biblioteca" && (
            <Biblioteca user={user} apiUrl={apiUrl} />
          )}
          {activeTab === "programas" && (
            <Programas user={user} apiUrl={apiUrl} />
          )}
          {activeTab === "institucionales" && (
            <SonidosInstitucionales user={user} apiUrl={apiUrl} />
          )}
          {activeTab === "usuarios" && <Usuarios user={user} apiUrl={apiUrl} />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
