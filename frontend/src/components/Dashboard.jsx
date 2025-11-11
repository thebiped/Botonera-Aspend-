"use client"

import { useState } from "react"
import Biblioteca from "./Biblioteca"
import Programas from "./Programas"
import SonidosInstitucionales from "./SonidosInstitucionales"
import Usuarios from "./Usuarios"

function Dashboard({ user, onLogout, apiUrl }) {
  const [activeTab, setActiveTab] = useState("biblioteca")

  const tabs = [
    { id: "biblioteca", label: "Biblioteca", roles: ["admin", "operador", "productor"] },
    { id: "programas", label: "Programas", roles: ["admin", "operador", "productor"] },
    { id: "institucionales", label: "Sonidos Institucionales", roles: ["admin", "operador"] },
    { id: "usuarios", label: "Usuarios", roles: ["admin"] },
  ]

  const availableTabs = tabs.filter((tab) => tab.roles.includes(user.tipo))

  return (
    <div className="container">
      <div className="dashboard">
        <div className="header">
          <h1>Radio App</h1>
          <div className="user-info">
            <div>
              <strong>{user.n_usuario}</strong>
              <div className="user-badge">{user.tipo}</div>
            </div>
            <button className="btn btn-secondary btn-small" onClick={onLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="tabs">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "biblioteca" && <Biblioteca user={user} apiUrl={apiUrl} />}
        {activeTab === "programas" && <Programas user={user} apiUrl={apiUrl} />}
        {activeTab === "institucionales" && <SonidosInstitucionales user={user} apiUrl={apiUrl} />}
        {activeTab === "usuarios" && <Usuarios user={user} apiUrl={apiUrl} />}
      </div>
    </div>
  )
}

export default Dashboard
