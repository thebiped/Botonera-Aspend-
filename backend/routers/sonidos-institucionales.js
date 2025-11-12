const express = require("express")
const router = express.Router()
const db = require("../db")
const upload = require("../upload-config")

// Obtener todos los sonidos institucionales
router.get("/", (req, res) => {
  db.all("SELECT * FROM sonidos_institucionales ORDER BY id_sonidos_institucionales DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(rows)
  })
})

router.post(
  "/",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "imagen", maxCount: 1 },
  ]),
  (req, res) => {
    const { nombre, url_sonido, url_img, user_tipo } = req.body

    // Verificar que solo admin pueda crear
    if (user_tipo !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden crear sonidos institucionales" })
    }

    const audioUrl = req.files?.audio ? `http://localhost:3000/uploads/${req.files.audio[0].filename}` : url_sonido

    const imagenUrl = req.files?.imagen ? `http://localhost:3000/uploads/${req.files.imagen[0].filename}` : url_img

    const sql = "INSERT INTO sonidos_institucionales (nombre, url_sonido, url_img) VALUES (?, ?, ?)"

    db.run(sql, [nombre, audioUrl, imagenUrl], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.json({
        id_sonidos_institucionales: this.lastID,
        nombre,
        url_sonido: audioUrl,
        url_img: imagenUrl,
      })
    })
  },
)

router.put(
  "/:id",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "imagen", maxCount: 1 },
  ]),
  (req, res) => {
    const { nombre, url_sonido, url_img, user_tipo } = req.body
    const { id } = req.params

    // Verificar que solo admin pueda actualizar
    if (user_tipo !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden editar sonidos institucionales" })
    }

    const audioUrl = req.files?.audio ? `http://localhost:3000/uploads/${req.files.audio[0].filename}` : url_sonido

    const imagenUrl = req.files?.imagen ? `http://localhost:3000/uploads/${req.files.imagen[0].filename}` : url_img

    const sql =
      "UPDATE sonidos_institucionales SET nombre = ?, url_sonido = ?, url_img = ? WHERE id_sonidos_institucionales = ?"

    db.run(sql, [nombre, audioUrl, imagenUrl, id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.json({ message: "Sonido institucional actualizado correctamente" })
    })
  },
)

router.delete("/:id", (req, res) => {
  const { id } = req.params
  const { user_tipo } = req.body

  // Verificar que solo admin pueda eliminar
  if (user_tipo !== "admin") {
    return res.status(403).json({ error: "Solo administradores pueden eliminar sonidos institucionales" })
  }

  db.run("DELETE FROM sonidos_institucionales WHERE id_sonidos_institucionales = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json({ message: "Sonido institucional eliminado correctamente" })
  })
})

module.exports = router
