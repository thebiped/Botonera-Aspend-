# 🧪 Instrucciones de Testing

## ✅ Verificar la Instalación

### 1. Estructura de Archivos

Verifica que existan estos archivos:

```bash
# Componentes
frontend/src/components/Sidebar.jsx ✅

# CSS Files
frontend/src/assets/sidebar.css ✅
frontend/src/assets/dashboard.css ✅
frontend/src/assets/biblioteca.css ✅
frontend/src/assets/programas.css ✅
frontend/src/assets/sonidos-institucionales.css ✅
frontend/src/assets/usuarios.css ✅
```

### 2. Pruebas en el Navegador

#### A. Login como Admin

1. Inicia sesión con credenciales de admin
2. Verifica el sidebar con 4 items:
   - Biblioteca FX 📚
   - Programas 📻
   - Sonidos Institucionales 🔊
   - Usuarios 👥

#### B. Login como Operador

1. Inicia sesión con credenciales de operador
2. Verifica el sidebar con 3 items:
   - Biblioteca FX 📚
   - Programas 📻
   - Sonidos Institucionales 🔊

#### C. Login como Productor

1. Inicia sesión con credenciales de productor
2. Verifica el sidebar con 1 item:
   - Mis Programas 📻

### 3. Funcionalidad del Sidebar

#### Collapse/Expand

- [ ] Haz click en el botón "←/→" del sidebar
- [ ] El sidebar debe cambiar de 280px a 80px
- [ ] Los textos deben desaparecer
- [ ] Solo los iconos deben verse

#### Navegación

- [ ] Haz click en cada item del sidebar
- [ ] El contenido debe cambiar
- [ ] El item debe tener estado "active" (gradiente)

#### Logout

- [ ] Haz click en el botón "🚪 Cerrar Sesión"
- [ ] Debes volver al login

#### Avatar

- [ ] Verifica que el avatar muestre la primera letra del nombre
- [ ] Verifica que se muestre el rol del usuario

### 4. Responsivo

#### Desktop (1200px+)

- [ ] Sidebar completo (280px)
- [ ] Todo el contenido visible
- [ ] Todos los textos visibles

#### Tablet (768px-1199px)

- [ ] Sidebar se reduce a 250px
- [ ] Content area se ajusta
- [ ] Responsive bien

#### Mobile (480px-767px)

- [ ] Sidebar se reduce a 200px
- [ ] Puede haber scroll horizontal mínimo
- [ ] Todo legible

#### Very Small (< 480px)

- [ ] Sidebar muy delgado (60px)
- [ ] Solo iconos visibles
- [ ] Layout apilado

### 5. Componentes

#### Biblioteca

- [ ] Grid de cards responsivo
- [ ] Hover effects en cards
- [ ] Modal funcional para agregar sonidos
- [ ] Botón de nuevo sonido (admin/operador)

#### Programas

- [ ] Grid de cards
- [ ] Modal para crear programas (admin/operador)
- [ ] Modal para ver sonidos
- [ ] Botones con colores diferentes

#### Sonidos Institucionales

- [ ] Grid de cards
- [ ] Modal para agregar (admin/operador)
- [ ] No aparece para productor

#### Usuarios

- [ ] Lista de usuarios (solo admin)
- [ ] Inline editing de rol
- [ ] Botones de cambio y eliminar

### 6. Estilos y Colores

- [ ] Colores morado/azul consistentes
- [ ] Gradientes en sidebar
- [ ] Sombras sutiles en cards
- [ ] Efectos hover suaves
- [ ] Transiciones sin saltos

### 7. Consola del Navegador

- [ ] No hay errores en console
- [ ] No hay warnings
- [ ] Las llamadas a API funcionan

## 🐛 Si Algo No Funciona

### El Sidebar no aparece

```
✓ Verifica que Sidebar.jsx exista
✓ Verifica que Dashboard.jsx importe Sidebar
✓ Verifica que el CSS esté en assets/
✓ Recarga la página (Ctrl+F5)
```

### Los colores están mal

```
✓ Verifica que sidebar.css esté en assets/
✓ Verifica que no haya conflicto con index.css
✓ Abre DevTools (F12) y busca los estilos
```

### El collapse no funciona

```
✓ Verifica que toggleBtn exista en Sidebar.jsx
✓ Verifica que la clase "collapsed" esté en CSS
✓ Revisa la consola de errores
```

### La navegación no cambia

```
✓ Verifica que activeTab se propague correctamente
✓ Verifica que setActiveTab funcione
✓ Revisa el estado en React DevTools
```

## 📊 Checklist Final

- [ ] Sidebar creado y funcional
- [ ] CSS aplicados correctamente
- [ ] Dashboard integrado
- [ ] Todos los componentes con CSS
- [ ] Responsive en todos los tamaños
- [ ] Sin errores en consola
- [ ] Navegación funciona
- [ ] Collapse/Expand funciona
- [ ] Logout funciona
- [ ] Colores correctos
- [ ] Animaciones suaves

---

**¡Una vez verificados todos estos puntos, el sidebar estará 100% funcional!** ✅

Si hay algún problema, verifica:

1. Los nombres de archivos (sensible a mayúsculas)
2. Los imports en los componentes
3. La sintaxis CSS
4. La consola de errores
