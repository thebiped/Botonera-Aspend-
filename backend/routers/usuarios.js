const express = require("express")
const router = express.Router()

// === OBTENER TODOS LOS USUARIOS (sin contraseñas) ===
router.get("/", (req, res) => {
  const db = req.db

  db.all(`SELECT id_usuario, n_usuario, tipo, gmail FROM usuario`, [], (err, usuarios) => {
    if (err) return res.status(500).json({ error: "Error al obtener usuarios" })
    res.json(usuarios)
  })
})

// === OBTENER UN USUARIO POR ID (con datos personales) ===
router.get("/:id", (req, res) => {
  const db = req.db
  const { id } = req.params

  const query = `
    SELECT 
      u.id_usuario, 
      u.n_usuario, 
      u.tipo, 
      u.gmail,
      sp.nombre,
      sp.url_img
    FROM usuario u
    LEFT JOIN s_personales sp ON u.id_usuario = sp.id_usuario
    WHERE u.id_usuario = ?
  `

  db.get(query, [id], (err, usuario) => {
    if (err) return res.status(500).json({ error: "Error al obtener usuario" })
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" })
    res.json(usuario)
  })
})

// === ACTUALIZAR DATOS PERSONALES DE UN USUARIO ===
router.put("/:id/personales", (req, res) => {
  const db = req.db
  const { id } = req.params
  const { nombre, url_img } = req.body

  // Verificar si ya existen datos personales
  db.get(`SELECT * FROM s_personales WHERE id_usuario = ?`, [id], (err, existing) => {
    if (err) return res.status(500).json({ error: "Error al verificar datos" })

    if (existing) {
      // Actualizar
      db.run(`UPDATE s_personales SET nombre = ?, url_img = ? WHERE id_usuario = ?`, [nombre, url_img, id], (err) => {
        if (err) return res.status(500).json({ error: "Error al actualizar datos personales" })
        res.json({ mensaje: "Datos personales actualizados correctamente" })
      })
    } else {
      // Insertar
      db.run(
        `INSERT INTO s_personales (id_usuario, nombre, url_img) VALUES (?, ?, ?)`,
        [id, nombre, url_img],
        function (err) {
          if (err) return res.status(500).json({ error: "Error al crear datos personales" })
          res.json({
            mensaje: "Datos personales creados correctamente",
            id: this.lastID,
          })
        },
      )
    }
  })
})

// === ACTUALIZAR TIPO DE USUARIO ===
router.put("/:id/tipo", (req, res) => {
  const db = req.db
  const { id } = req.params
  const { tipo } = req.body

  if (!tipo) {
    return res.status(400).json({ error: "El tipo es requerido" })
  }

  db.run(`UPDATE usuario SET tipo = ? WHERE id_usuario = ?`, [tipo, id], function (err) {
    if (err) return res.status(500).json({ error: "Error al actualizar tipo de usuario" })
    if (this.changes === 0) return res.status(404).json({ error: "Usuario no encontrado" })
    res.json({ mensaje: "Tipo de usuario actualizado correctamente" })
  })
})

// === ELIMINAR UN USUARIO ===
router.delete("/:id", (req, res) => {
  const db = req.db
  const { id } = req.params

  // Primero eliminar datos personales
  db.run(`DELETE FROM s_personales WHERE id_usuario = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar datos personales" })

    // Luego eliminar el usuario
    db.run(`DELETE FROM usuario WHERE id_usuario = ?`, [id], function (err) {
      if (err) return res.status(500).json({ error: "Error al eliminar usuario" })
      if (this.changes === 0) return res.status(404).json({ error: "Usuario no encontrado" })
      res.json({ mensaje: "Usuario eliminado correctamente" })
    })
  })
})

module.exports = router
