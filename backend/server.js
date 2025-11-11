// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // Importa la base de datos lista

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para pasar la BD a todos los routers
app.use((req, res, next) => {
  req.db = db;
  next();
});

// === Rutas ===
const authRouter = require('./routers/auth');
const programasRouter = require('./routers/programas');
const sonidosRouter = require('./routers/sonidos');
const sonidosInstitucionalesRouter = require('./routers/sonidos-institucionales');
const usuariosRouter = require('./routers/usuarios');

app.use('/api/auth', authRouter);
app.use('/api/programas', programasRouter);
app.use('/api/sonidos', sonidosRouter);
app.use('/api/sonidos-institucionales', sonidosInstitucionalesRouter);
app.use('/api/usuarios', usuariosRouter);

// === Iniciar servidor ===
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
});
