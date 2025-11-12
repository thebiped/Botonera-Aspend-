# 🔑 Key Code - Cambios Importantes

## 1️⃣ Sidebar - Navegación Dinámica por Rol

```jsx
// frontend/src/components/Sidebar.jsx
const getSidebarItems = () => {
  const baseItems = [];

  if (user.tipo === "admin") {
    baseItems.push(
      { id: "biblioteca", label: "Biblioteca FX", icon: "📚" },
      { id: "programas", label: "Programas", icon: "📻" },
      { id: "institucionales", label: "Sonidos Institucionales", icon: "🔊" },
      { id: "usuarios", label: "Usuarios", icon: "👥" }
    );
  } else if (user.tipo === "operador") {
    baseItems.push(
      { id: "biblioteca", label: "Biblioteca FX", icon: "📚" },
      { id: "programas", label: "Programas", icon: "📻" },
      { id: "institucionales", label: "Sonidos Institucionales", icon: "🔊" }
    );
  } else if (user.tipo === "productor") {
    baseItems.push({ id: "programas", label: "Mis Programas", icon: "📻" });
  }

  return baseItems;
};
```

## 2️⃣ Dashboard - Integración Layout

```jsx
// frontend/src/components/Dashboard.jsx
return (
  <div className="dashboard-layout">
    <Sidebar
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
    />

    <div className="dashboard-content">
      <div className="header">
        <h1>Radio App</h1>
        <div className="user-info">
          <div>
            <strong>{user.n_usuario}</strong>
            <div className="user-badge">{user.tipo}</div>
          </div>
        </div>
      </div>

      <div className="content-area">
        {activeTab === "biblioteca" && (
          <Biblioteca user={user} apiUrl={apiUrl} />
        )}
        {activeTab === "programas" && <Programas user={user} apiUrl={apiUrl} />}
        {activeTab === "institucionales" && (
          <SonidosInstitucionales user={user} apiUrl={apiUrl} />
        )}
        {activeTab === "usuarios" && <Usuarios user={user} apiUrl={apiUrl} />}
      </div>
    </div>
  </div>
);
```

## 3️⃣ CSS - Gradiente Sidebar

```css
/* frontend/src/assets/sidebar.css */
.sidebar {
  width: 280px;
  background: linear-gradient(
    to bottom right,
    rgba(75, 30, 133, 1),
    rgba(75, 30, 133, 0.95)
  );
  border-right: 2px solid rgba(75, 30, 133, 0.3);
  box-shadow: 0 0 12px rgba(75, 30, 133, 0.3), inset 0 0 12px rgba(75, 30, 133, 0.1);
  transition: width 0.3s ease;
}
```

## 4️⃣ CSS - Active State

```css
.sidebar-item.active {
  background: linear-gradient(
    to bottom right,
    rgba(155, 89, 182, 0.4),
    rgba(155, 89, 182, 0.2)
  );
  border-color: rgba(155, 89, 182, 0.8);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(155, 89, 182, 0.5), inset 0 0 12px rgba(155, 89, 182, 0.2);
}
```

## 5️⃣ CSS - Layout Dashboard

```css
/* frontend/src/assets/dashboard.css */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-content {
  flex: 1;
  margin-left: 280px;
  padding: 30px 40px;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
}
```

## 6️⃣ Collapse/Expand Sidebar

```jsx
// En Sidebar.jsx
const [isCollapsed, setIsCollapsed] = useState(false)

<button
  className="toggle-btn"
  onClick={() => setIsCollapsed(!isCollapsed)}
  title={isCollapsed ? "Expandir" : "Contraer"}
>
  {isCollapsed ? "→" : "←"}
</button>
```

```css
/* En sidebar.css */
.sidebar.collapsed {
  width: 80px;
}
```

## 7️⃣ Avatar Dinámico

```jsx
<div className="user-avatar">{user.n_usuario.charAt(0).toUpperCase()}</div>
```

## 8️⃣ Import CSS en Componentes

```jsx
// Biblioteca.jsx
import "../assets/biblioteca.css";

// Programas.jsx
import "../assets/programas.css";

// SonidosInstitucionales.jsx
import "../assets/sonidos-institucionales.css";

// Usuarios.jsx
import "../assets/usuarios.css";

// Dashboard.jsx
import "../assets/dashboard.css";
```

## 9️⃣ Responsivo Breakpoints

```css
/* Tablet */
@media (max-width: 768px) {
  .dashboard-content {
    margin-left: 250px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .dashboard-content {
    margin-left: 200px;
  }
}
```

## 🔟 Estado Inicial Dashboard

```jsx
// Productor inicia en Programas, otros en Biblioteca
const [activeTab, setActiveTab] = useState(
  user.tipo === "productor" ? "programas" : "biblioteca"
);
```

---

## 📌 Notas Importantes

✅ **Sin cambios en backend**
✅ **API calls intactas**
✅ **Autenticación sin cambios**
✅ **Base de datos sin cambios**
✅ **Todo es modular y escalable**

---

**Estos son los snippets clave que hacen que todo funcione.** 🎯
