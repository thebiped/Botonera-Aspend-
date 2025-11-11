const express = require("express")
const router = express.Router()
const db = require("../db")
const upload = require("../upload-config")

// Obtener todos los sonidos
router.get("/", (req, res) => {
  db.all("SELECT * FROM sonidos ORDER BY id_sonido DESC", [], (err, rows) => {
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
    const { nombre_sonido, url_sonidos, url_img } = req.body

    // Usar archivos subidos o URLs proporcionadas
    const audioUrl = req.files?.audio ? `http://localhost:3000/uploads/${req.files.audio[0].filename}` : url_sonidos

    const imagenUrl = req.files?.imagen ? `http://localhost:3000/uploads/${req.files.imagen[0].filename}` : url_img

    const sql = "INSERT INTO sonidos (nombre_sonido, url_sonidos, url_img) VALUES (?, ?, ?)"

    db.run(sql, [nombre_sonido, audioUrl, imagenUrl], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.json({
        id_sonido: this.lastID,
        nombre_sonido,
        url_sonidos: audioUrl,
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
    const { nombre_sonido, url_sonidos, url_img } = req.body
    const { id } = req.params

    // Usar archivos subidos o URLs proporcionadas o mantener las existentes
    const audioUrl = req.files?.audio ? `http://localhost:3000/uploads/${req.files.audio[0].filename}` : url_sonidos

    const imagenUrl = req.files?.imagen ? `http://localhost:3000/uploads/${req.files.imagen[0].filename}` : url_img

    const sql = "UPDATE sonidos SET nombre_sonido = ?, url_sonidos = ?, url_img = ? WHERE id_sonido = ?"

    db.run(sql, [nombre_sonido, audioUrl, imagenUrl, id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.json({ message: "Sonido actualizado correctamente" })
    })
  },
)

// Eliminar sonido
router.delete("/:id", (req, res) => {
  const { id } = req.params

  db.run("DELETE FROM sonidos WHERE id_sonido = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json({ message: "Sonido eliminado correctamente" })
  })
})

module.exports = router
