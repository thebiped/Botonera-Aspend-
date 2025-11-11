const express = require("express")
const router = express.Router()

// === OBTENER TODOS LOS PROGRAMAS ===
router.get("/", (req, res) => {
  const db = req.db

  db.all(`SELECT * FROM programas`, [], (err, programas) => {
    if (err) return res.status(500).json({ error: "Error al obtener programas" })
    res.json(programas)
  })
})

// === OBTENER UN PROGRAMA POR ID ===
router.get("/:id", (req, res) => {
  const db = req.db
  const { id } = req.params

  db.get(`SELECT * FROM programas WHERE id_programa = ?`, [id], (err, programa) => {
    if (err) return res.status(500).json({ error: "Error al obtener programa" })
    if (!programa) return res.status(404).json({ error: "Programa no encontrado" })
    res.json(programa)
  })
})

// === OBTENER SONIDOS DE UN PROGRAMA ===
router.get("/:id/sonidos", (req, res) => {
  const db = req.db
  const { id } = req.params

  const query = `
    SELECT s.* 
    FROM sonidos s
    INNER JOIN programa_sonidos ps ON s.id_sonido = ps.id_sonido
    WHERE ps.id_programa = ?
  `

  db.all(query, [id], (err, sonidos) => {
    if (err) return res.status(500).json({ error: "Error al obtener sonidos del programa" })
    res.json(sonidos)
  })
})

// === CREAR UN NUEVO PROGRAMA ===
router.post("/", (req, res) => {
  const db = req.db
  const { nombre, descripcion, horario } = req.body

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es requerido" })
  }

  db.run(
    `INSERT INTO programas (nombre, descripcion, horario) VALUES (?, ?, ?)`,
    [nombre, descripcion, horario],
    function (err) {
      if (err) return res.status(500).json({ error: "Error al crear programa" })
      res.json({
        mensaje: "Programa creado correctamente",
        id: this.lastID,
      })
    },
  )
})

// === ACTUALIZAR UN PROGRAMA ===
router.put("/:id", (req, res) => {
  const db = req.db
  const { id } = req.params
  const { nombre, descripcion, horario } = req.body

  db.run(
    `UPDATE programas SET nombre = ?, descripcion = ?, horario = ? WHERE id_programa = ?`,
    [nombre, descripcion, horario, id],
    function (err) {
      if (err) return res.status(500).json({ error: "Error al actualizar programa" })
      if (this.changes === 0) return res.status(404).json({ error: "Programa no encontrado" })
      res.json({ mensaje: "Programa actualizado correctamente" })
    },
  )
})

// === ELIMINAR UN PROGRAMA ===
router.delete("/:id", (req, res) => {
  const db = req.db
  const { id } = req.params

  // Primero eliminar las relaciones en programa_sonidos
  db.run(`DELETE FROM programa_sonidos WHERE id_programa = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar relaciones" })

    // Luego eliminar el programa
    db.run(`DELETE FROM programas WHERE id_programa = ?`, [id], function (err) {
      if (err) return res.status(500).json({ error: "Error al eliminar programa" })
      if (this.changes === 0) return res.status(404).json({ error: "Programa no encontrado" })
      res.json({ mensaje: "Programa eliminado correctamente" })
    })
  })
})

// === AGREGAR SONIDO A UN PROGRAMA ===
router.post("/:id/sonidos", (req, res) => {
  const db = req.db
  const { id } = req.params
  const { id_sonido } = req.body

  if (!id_sonido) {
    return res.status(400).json({ error: "El id_sonido es requerido" })
  }

  db.run(`INSERT INTO programa_sonidos (id_programa, id_sonido) VALUES (?, ?)`, [id, id_sonido], function (err) {
    if (err) return res.status(500).json({ error: "Error al agregar sonido al programa" })
    res.json({
      mensaje: "Sonido agregado al programa correctamente",
      id: this.lastID,
    })
  })
})

// === ELIMINAR SONIDO DE UN PROGRAMA ===
router.delete("/:id/sonidos/:id_sonido", (req, res) => {
  const db = req.db
  const { id, id_sonido } = req.params

  db.run(`DELETE FROM programa_sonidos WHERE id_programa = ? AND id_sonido = ?`, [id, id_sonido], function (err) {
    if (err) return res.status(500).json({ error: "Error al eliminar sonido del programa" })
    if (this.changes === 0) return res.status(404).json({ error: "Relación no encontrada" })
    res.json({ mensaje: "Sonido eliminado del programa correctamente" })
  })
})

module.exports = router
