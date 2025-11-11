# Radio App - Frontend

Aplicación frontend en React + Vite para gestionar una radio.

## Instalación

\`\`\`bash
cd frontend
npm install
\`\`\`

## Ejecutar

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## Configuración

Asegúrate de que el backend esté corriendo en `http://localhost:3001`

## Funcionalidades por Rol

### Admin
- Biblioteca de sonidos (CRUD)
- Programas (CRUD + gestión de sonidos)
- Sonidos institucionales (CRUD)
- Gestión de usuarios (cambiar roles, eliminar)

### Operador
- Biblioteca de sonidos (CRUD)
- Programas (CRUD + gestión de sonidos)
- Sonidos institucionales (CRUD)

### Productor
- Biblioteca de sonidos (solo ver)
- Programas (ver + escuchar sonidos)
