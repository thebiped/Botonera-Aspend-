const express = require("express");
const router = express.Router();
const db = require("../db");
const upload = require("../upload-config");

// ✅ Obtener todos los sonidos del usuario actual
router.get("/", (req, res) => {
  const { id_usuario } = req.query; // id_usuario enviado desde frontend

  if (!id_usuario) {
    return res.status(400).json({ error: "Se requiere id_usuario" });
  }

  const sql = `
    SELECT *
    FROM sonidos
    WHERE id_usuario = ?
    ORDER BY id_sonido DESC
  `;

  db.all(sql, [id_usuario], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ Crear un nuevo sonido
router.post(
  "/",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "imagen", maxCount: 1 },
  ]),
  (req, res) => {
    const { nombre_sonido, id_usuario } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: "Se requiere id_usuario" });
    }

    const audioUrl = req.files?.audio
      ? `http://localhost:3000/uploads/${req.files.audio[0].filename}`
      : null;
    const imagenUrl = req.files?.imagen
      ? `http://localhost:3000/uploads/${req.files.imagen[0].filename}`
      : null;

    const sql =
      "INSERT INTO sonidos (nombre_sonido, url_sonidos, url_img, id_usuario) VALUES (?, ?, ?, ?)";

    db.run(sql, [nombre_sonido, audioUrl, imagenUrl, id_usuario], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id_sonido: this.lastID,
        nombre_sonido,
        url_sonidos: audioUrl,
        url_img: imagenUrl,
        id_usuario,
      });
    });
  }
);

// ✅ Actualizar un sonido (solo propio)
router.put(
  "/:id",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "imagen", maxCount: 1 },
  ]),
  (req, res) => {
    const { id } = req.params;
    const { nombre_sonido, id_usuario } = req.body;

    if (!id_usuario) return res.status(400).json({ error: "Se requiere id_usuario" });

    const audioUrl = req.files?.audio
      ? `http://localhost:3000/uploads/${req.files.audio[0].filename}`
      : req.body.url_sonidos;
    const imagenUrl = req.files?.imagen
      ? `http://localhost:3000/uploads/${req.files.imagen[0].filename}`
      : req.body.url_img;

    // Solo se permite actualizar si el sonido pertenece al usuario
    const sqlCheck = "SELECT * FROM sonidos WHERE id_sonido = ? AND id_usuario = ?";
    db.get(sqlCheck, [id, id_usuario], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(403).json({ error: "No tienes permisos para actualizar este sonido" });

      const sqlUpdate =
        "UPDATE sonidos SET nombre_sonido = ?, url_sonidos = ?, url_img = ? WHERE id_sonido = ?";
      db.run(sqlUpdate, [nombre_sonido, audioUrl, imagenUrl, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Sonido actualizado correctamente" });
      });
    });
  }
);

// ✅ Eliminar un sonido (solo propio)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const { id_usuario } = req.query;

  if (!id_usuario) return res.status(400).json({ error: "Se requiere id_usuario" });

  const sqlCheck = "SELECT * FROM sonidos WHERE id_sonido = ? AND id_usuario = ?";
  db.get(sqlCheck, [id, id_usuario], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(403).json({ error: "No tienes permisos para eliminar este sonido" });

    db.run("DELETE FROM sonidos WHERE id_sonido = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Sonido eliminado correctamente" });
    });
  });
});

module.exports = router;
