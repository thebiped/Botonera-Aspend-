"use client";

import { useState, useEffect } from "react";
import "../assets/sonidos-institucionales.css";
import AudioPlayer from "./AudioPlayer";

function SonidosInstitucionales({ user, apiUrl }) {
  const [sonidos, setSonidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    url_sonido: "",
    url_img: "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    fetchSonidos();
  }, []);

  const fetchSonidos = async () => {
    try {
      const res = await fetch(`${apiUrl}/sonidos-institucionales`);
      const data = await res.json();

      if (res.ok) {
        setSonidos(data);
      }
    } catch (err) {
      console.error("Error al obtener sonidos institucionales:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId
        ? `/sonidos-institucionales/${editingId}`
        : "/sonidos-institucionales";

      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre);

      if (audioFile) {
        formDataToSend.append("audio", audioFile);
      } else if (formData.url_sonido) {
        formDataToSend.append("url_sonido", formData.url_sonido);
      }

      if (imagenFile) {
        formDataToSend.append("imagen", imagenFile);
      } else if (formData.url_img) {
        formDataToSend.append("url_img", formData.url_img);
      }

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method,
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        fetchSonidos();
        setShowModal(false);
        setFormData({ nombre: "", url_sonido: "", url_img: "" });
        setAudioFile(null);
        setImagenFile(null);
        setEditingId(null);
      } else {
        alert(data.error || "Error al guardar el sonido institucional");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este sonido institucional?"))
      return;

    try {
      const res = await fetch(`${apiUrl}/sonidos-institucionales/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSonidos();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar el sonido institucional");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const handleEdit = (sonido) => {
    setFormData({
      nombre: sonido.nombre,
      url_sonido: sonido.url_sonido || "",
      url_img: sonido.url_img || "",
    });
    setAudioFile(null);
    setImagenFile(null);
    setEditingId(sonido.id_sonidos_institucionales);
    setShowModal(true);
  };

  const handlePlaySound = (sonido) => {
    setCurrentlyPlaying(sonido);
  };

  if (loading)
    return (
      <div className="institucionales-loading">
        Cargando sonidos institucionales...
      </div>
    );

  return (
    <div className="institucionales-container">
      <div className="institucionales-header">
        <h2>Programas institucionales</h2>
        <button
          className="institucionales-btn-agregar"
          onClick={() => {
            setShowModal(true);
            setEditingId(null);
            setFormData({ nombre: "", url_sonido: "", url_img: "" });
            setAudioFile(null);
            setImagenFile(null);
          }}
        >
          + Agregar programa institucional
        </button>
      </div>

      {sonidos.length === 0 ? (
        <div className="institucionales-empty">
          <h3>No hay sonidos institucionales</h3>
          <p>Agrega el primer sonido institucional</p>
        </div>
      ) : (
        <div className="institucionales-grid">
          {sonidos.map((sonido) => (
            <div
              key={sonido.id_sonidos_institucionales}
              className="institucional-card"
            >
              <div
                className="institucional-card-play"
                onClick={() => handlePlaySound(sonido)}
              >
                ▶
              </div>
              <h3 className="institucional-card-title">{sonido.nombre}</h3>
              <p className="institucional-card-duration">Duración: 0:25</p>
              <div className="institucional-card-actions">
                <button
                  className="institucional-card-edit"
                  onClick={() => handleEdit(sonido)}
                >
                  ✎
                </button>
                <button
                  className="institucional-card-delete"
                  onClick={() =>
                    handleDelete(sonido.id_sonidos_institucionales)
                  }
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentlyPlaying && (
        <AudioPlayer
          sonido={currentlyPlaying}
          isPlaying={true}
          onClose={() => setCurrentlyPlaying(null)}
        />
      )}

      {showModal && (
        <div
          className="institucionales-modal"
          onClick={() => setShowModal(false)}
        >
          <div
            className="institucionales-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>
              {editingId
                ? "Editar Sonido Institucional"
                : "Nuevo Sonido Institucional"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="institucionales-form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div className="institucionales-form-group">
                <label>Audio del Sonido</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    setAudioFile(e.target.files[0]);
                    setFormData({ ...formData, url_sonido: "" });
                  }}
                />
                {audioFile && (
                  <p className="institucionales-form-success">
                    Archivo seleccionado: {audioFile.name}
                  </p>
                )}
              </div>

              <div className="institucionales-form-group">
                <label>O ingresa URL del audio</label>
                <input
                  type="text"
                  value={formData.url_sonido}
                  onChange={(e) => {
                    setFormData({ ...formData, url_sonido: e.target.value });
                    setAudioFile(null);
                  }}
                  placeholder="https://ejemplo.com/sonido.mp3"
                  disabled={audioFile !== null}
                />
              </div>

              <div className="institucionales-form-group">
                <label>Imagen del Sonido</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setImagenFile(e.target.files[0]);
                    setFormData({ ...formData, url_img: "" });
                  }}
                />
                {imagenFile && (
                  <p className="institucionales-form-success">
                    Archivo seleccionado: {imagenFile.name}
                  </p>
                )}
              </div>

              <div className="institucionales-form-group">
                <label>O ingresa URL de la imagen</label>
                <input
                  type="text"
                  value={formData.url_img}
                  onChange={(e) => {
                    setFormData({ ...formData, url_img: e.target.value });
                    setImagenFile(null);
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={imagenFile !== null}
                />
              </div>

              <div className="institucionales-modal-buttons">
                <button type="submit" className="institucionales-btn-submit">
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  className="institucionales-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SonidosInstitucionales;
