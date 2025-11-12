# 🎨 Guía de Personalización del Sidebar

## Cómo Cambiar Colores

### Colores Principales en `sidebar.css`

```css
/* Cambiar color principal del sidebar */
.sidebar {
  background: linear-gradient(
    to bottom right,
    rgba(75, 30, 133, 1),
    rgba(75, 30, 133, 0.95)
  );
  /* Modifica estos valores RGB para otro color */
}

/* Cambiar color del gradiente de items activos */
.sidebar-item.active {
  background: linear-gradient(
    to bottom right,
    rgba(155, 89, 182, 0.4),
    rgba(155, 89, 182, 0.2)
  );
  border-color: rgba(155, 89, 182, 0.8);
}
```

## Cómo Cambiar Iconos

En `Sidebar.jsx`, modifica los iconos de cada item:

```jsx
baseItems.push(
  { id: "biblioteca", label: "Biblioteca FX", icon: "📚" }, // Cambiar emoji
  { id: "programas", label: "Programas", icon: "📻" }
  // ...
);
```

## Cómo Agregar Nuevos Items

```jsx
// En el método getSidebarItems():
if (user.tipo === "admin") {
  baseItems.push(
    { id: "biblioteca", label: "Biblioteca FX", icon: "📚" },
    { id: "programas", label: "Programas", icon: "📻" },
    // NUEVO ITEM:
    { id: "reportes", label: "Reportes", icon: "📊" }
  );
}
```

## Cómo Cambiar Anchos del Sidebar

En `sidebar.css`:

```css
.sidebar {
  width: 280px; /* Cambiar este valor */
}

.sidebar.collapsed {
  width: 80px; /* Ancho cuando está colapsado */
}
```

## Cómo Modificar la Velocidad de Animaciones

```css
.sidebar {
  transition: width 0.3s ease; /* 0.3s es la duración actual */
}

.sidebar-item:hover {
  transition: all 0.3s ease; /* Cambiar 0.3s a otro valor */
}
```

## Cómo Cambiar el Layout del Dashboard

En `dashboard.css`:

```css
.dashboard-content {
  margin-left: 280px; /* Margen del sidebar */
  padding: 30px 40px; /* Espaciado interno */
}
```

## Temas Predefinidos

### Tema Azul (Actual)

```css
Primary: #667eea
Purple: #9b59b6
```

### Tema Verde

```css
Primary: #27ae60
Secondary: #16a085
```

### Tema Rojo

```css
Primary: #e74c3c
Secondary: #c0392b
```

## Modo Oscuro (Opcional)

Para implementar un modo oscuro, agregar a `sidebar.css`:

```css
@media (prefers-color-scheme: dark) {
  .sidebar {
    background: linear-gradient(
      to bottom right,
      rgba(50, 20, 70, 1),
      rgba(50, 20, 70, 0.95)
    );
  }

  .sidebar-item {
    color: rgba(240, 240, 240, 0.9);
  }
}
```

---

**Nota:** Los cambios en CSS requieren guardar los archivos para que se reflejen en el navegador.
