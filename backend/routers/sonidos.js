const express = require("express");
const router = express.Router();
const db = require("../db");
const upload = require("../upload-config");

// ✅ Obtener todos los sonidos (solo los del usuario actual)
router.get("/", (req, res) => {
  const { id_usuario } = req.query;
  let sql = "SELECT * FROM sonidos";
  const params = [];

  if (id_usuario) {
    sql += " WHERE id_usuario = ?";
    params.push(id_usuario);
  }

  sql += " ORDER BY id_sonido DESC";
  db.all(sql, params, (err, rows) => {
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
    const { nombre_sonido, url_sonidos, url_img, id_usuario } = req.body;
    const audioUrl = req.files?.audio
      ? `http://localhost:3000/uploads/${req.files.audio[0].filename}`
      : url_sonidos;
    const imagenUrl = req.files?.imagen
      ? `http://localhost:3000/uploads/${req.files.imagen[0].filename}`
      : url_img;

    const sql =
      "INSERT INTO sonidos (nombre_sonido, url_sonidos, url_img, id_usuario) VALUES (?, ?, ?, ?)";
    db.run(
      sql,
      [nombre_sonido, audioUrl, imagenUrl, id_usuario],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id_sonido: this.lastID,
          nombre_sonido,
          url_sonidos: audioUrl,
          url_img: imagenUrl,
          id_usuario,
        });
      }
    );
  }
);

// ✅ Actualizar un sonido
router.put(
  "/:id",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "imagen", maxCount: 1 },
  ]),
  (req, res) => {
    const { nombre_sonido, url_sonidos, url_img } = req.body;
    const { id } = req.params;

    const audioUrl = req.files?.audio
      ? `http://localhost:3000/uploads/${req.files.audio[0].filename}`
      : url_sonidos;
    const imagenUrl = req.files?.imagen
      ? `http://localhost:3000/uploads/${req.files.imagen[0].filename}`
      : url_img;

    const sql =
      "UPDATE sonidos SET nombre_sonido = ?, url_sonidos = ?, url_img = ? WHERE id_sonido = ?";
    db.run(sql, [nombre_sonido, audioUrl, imagenUrl, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Sonido actualizado correctamente" });
    });
  }
);

// ✅ Eliminar un sonido
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM sonidos WHERE id_sonido = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Sonido eliminado correctamente" });
  });
});

module.exports = router;
