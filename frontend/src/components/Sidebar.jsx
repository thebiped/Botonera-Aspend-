"use client";

import { useState } from "react";
import {
  Music,
  Radio,
  Volume2,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  LogOut,
} from "lucide-react";
import "../assets/sidebar.css";

function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Definir items del sidebar según el rol
  const getSidebarItems = () => {
    const baseItems = [];

    if (user.tipo === "admin") {
      baseItems.push(
        { id: "biblioteca", label: "Biblioteca FX", Icon: Music },
        { id: "programas", label: "Programas", Icon: Radio },
        {
          id: "institucionales",
          label: "Sonidos Institucionales",
          Icon: Volume2,
        },
        { id: "usuarios", label: "Usuarios", Icon: Users }
      );
    } else if (user.tipo === "operador") {
      baseItems.push(
        { id: "biblioteca", label: "Biblioteca FX", Icon: Music },
        { id: "programas", label: "Programas", Icon: Radio },
        {
          id: "institucionales",
          label: "Sonidos Institucionales",
          Icon: Volume2,
        }
      );
    } else if (user.tipo === "productor") {
      baseItems.push({ id: "programas", label: "Mis Programas", Icon: Radio });
    }

    return baseItems;
  };

  const sidebarItems = getSidebarItems();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <h2 className={isCollapsed ? "hidden" : ""}>Aspend 102.6</h2>
        <button
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Contraer"}
        >
          {isCollapsed ? (
            <ChevronRight size={20} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={20} strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? item.label : ""}
          >
            <span className="item-icon">
              <item.Icon size={22} strokeWidth={2} />
            </span>
            {!isCollapsed && <span className="item-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer: user + actions */}
      <div className="sidebar-footer">
        <div className="sidebar-user-footer">
          <div className="user-row">
            <div className="user-avatar">
              {user && user.n_usuario
                ? user.n_usuario.charAt(0).toUpperCase()
                : "U"}
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <p className="user-name">{user.n_usuario}</p>
                <p className="user-role">{user.tipo}</p>
              </div>
            )}
            <button
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title="Opciones de usuario"
            >
              <MoreVertical size={18} strokeWidth={2.5} />
            </button>
          </div>

          {showUserMenu && (
            <div className="user-menu" role="dialog" aria-modal="true">
              <button className="user-menu-item" onClick={onLogout}>
                <LogOut size={16} strokeWidth={2.5} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
