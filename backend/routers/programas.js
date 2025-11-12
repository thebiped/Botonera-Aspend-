const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  const db = req.db
  const { id_usuario } = req.query

  let query = "SELECT * FROM programas"
  let params = []

  // Si se proporciona id_usuario, filtrar por ese usuario
  if (id_usuario) {
    query = `
      SELECT p.* 
      FROM programas p
      INNER JOIN programa_usuario pu ON p.id_programa = pu.id_programa
      WHERE pu.id_usuario = ?
    `
    params = [id_usuario]
  }

  db.all(query, params, (err, programas) => {
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

router.post("/", (req, res) => {
  const db = req.db
  const { nombre, descripcion, horario, user_tipo } = req.body

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es requerido" })
  }

  // Verificar que solo admin pueda crear
  if (user_tipo !== "admin") {
    return res.status(403).json({ error: "Solo administradores pueden crear programas" })
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

router.delete("/:id", (req, res) => {
  const db = req.db
  const { id } = req.params
  const { user_tipo } = req.query

  // Verificar que solo admin pueda eliminar
  if (user_tipo !== "admin") {
    return res.status(403).json({ error: "Solo administradores pueden eliminar programas" })
  }

  // Primero eliminar las relaciones
  db.run(`DELETE FROM programa_sonidos WHERE id_programa = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar relaciones de sonidos" })

    db.run(`DELETE FROM programa_usuario WHERE id_programa = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: "Error al eliminar relaciones de usuarios" })

      // Luego eliminar el programa
      db.run(`DELETE FROM programas WHERE id_programa = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: "Error al eliminar programa" })
        if (this.changes === 0) return res.status(404).json({ error: "Programa no encontrado" })
        res.json({ mensaje: "Programa eliminado correctamente" })
      })
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

router.post("/:id/usuarios", (req, res) => {
  const db = req.db
  const { id } = req.params
  const { id_usuario } = req.body

  if (!id_usuario) {
    return res.status(400).json({ error: "El id_usuario es requerido" })
  }

  db.run(`INSERT INTO programa_usuario (id_programa, id_usuario) VALUES (?, ?)`, [id, id_usuario], function (err) {
    if (err) {
      return res.status(500).json({ error: "Error al asignar programa al usuario" })
    }
    res.json({
      mensaje: "Programa asignado al usuario correctamente",
      id: this.lastID,
    })
  })
})

router.delete("/:id/usuarios/:id_usuario", (req, res) => {
  const db = req.db
  const { id, id_usuario } = req.params

  db.run(`DELETE FROM programa_usuario WHERE id_programa = ? AND id_usuario = ?`, [id, id_usuario], function (err) {
    if (err) return res.status(500).json({ error: "Error al desasignar programa del usuario" })
    if (this.changes === 0) return res.status(404).json({ error: "Asignación no encontrada" })
    res.json({ mensaje: "Programa desasignado del usuario correctamente" })
  })
})

router.get("/:id/usuarios", (req, res) => {
  const db = req.db
  const { id } = req.params

  const query = `
    SELECT u.id_usuario, u.n_usuario, u.gmail, u.tipo
    FROM usuario u
    INNER JOIN programa_usuario pu ON u.id_usuario = pu.id_usuario
    WHERE pu.id_programa = ?
  `

  db.all(query, [id], (err, usuarios) => {
    if (err) return res.status(500).json({ error: "Error al obtener usuarios del programa" })
    res.json(usuarios)
  })
})

module.exports = router
