// db.js
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.resolve(__dirname, "./botonera.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❗ No se pudo crear la BD:", err.message);
  } else {
    console.log("✔ Conectado a la base de datos");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    n_usuario TEXT NOT NULL UNIQUE,
    contrasena TEXT NOT NULL,
    tipo TEXT,
    gmail TEXT UNIQUE
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS subtipo (
    id_subtipo INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_subtipo TEXT,
    puntos INTEGER
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS s_personales (
    id_s_personales INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER,
    nombre TEXT,
    url_img TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS programas (
    id_programa INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    horario TEXT
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS sonidos (
    id_sonido INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_sonido TEXT NOT NULL,
    url_sonidos TEXT,
    url_img TEXT,
    id_usuario INTEGER,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS programa_sonidos (
    id_programa_sonidos INTEGER PRIMARY KEY AUTOINCREMENT,
    id_programa INTEGER,
    id_sonido INTEGER,
    FOREIGN KEY (id_programa) REFERENCES programas(id_programa),
    FOREIGN KEY (id_sonido) REFERENCES sonidos(id_sonido)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS programa_usuario (
    id_programa_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    id_programa INTEGER,
    id_usuario INTEGER,
    FOREIGN KEY (id_programa) REFERENCES programas(id_programa),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    UNIQUE(id_programa, id_usuario)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS sonidos_institucionales (
    id_sonidos_institucionales INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    url_img TEXT,
    url_sonido TEXT
  )
`)
module.exports = db;
