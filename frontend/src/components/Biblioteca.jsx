"use client";

import { useState, useEffect } from "react";
import "../assets/biblioteca.css";
import AudioPlayer from "./AudioPlayer";

function Biblioteca({ user, apiUrl }) {
  const [sonidos, setSonidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre_sonido: "",
    url_sonidos: "",
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
      const res = await fetch(`${apiUrl}/sonidos`);
      const data = await res.json();

      if (res.ok) {
        setSonidos(data);
      }
    } catch (err) {
      console.error("Error al obtener sonidos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? `/sonidos/${editingId}` : "/sonidos";

      const formDataToSend = new FormData();
      formDataToSend.append("nombre_sonido", formData.nombre_sonido);

      if (audioFile) {
        formDataToSend.append("audio", audioFile);
      } else if (formData.url_sonidos) {
        formDataToSend.append("url_sonidos", formData.url_sonidos);
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
        setFormData({ nombre_sonido: "", url_sonidos: "", url_img: "" });
        setAudioFile(null);
        setImagenFile(null);
        setEditingId(null);
      } else {
        alert(data.error || "Error al guardar el sonido");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este sonido?")) return;

    try {
      const res = await fetch(`${apiUrl}/sonidos/${id}`, { method: "DELETE" });

      if (res.ok) {
        fetchSonidos();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar el sonido");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const handleEdit = (sonido) => {
    setFormData({
      nombre_sonido: sonido.nombre_sonido,
      url_sonidos: sonido.url_sonidos || "",
      url_img: sonido.url_img || "",
    });
    setAudioFile(null);
    setImagenFile(null);
    setEditingId(sonido.id_sonido);
    setShowModal(true);
  };

  const handlePlaySound = (sonido) => {
    setCurrentlyPlaying(sonido);
  };

  const canEdit = user && (user.tipo === "admin" || user.tipo === "operador");

  if (loading)
    return <div className="biblioteca-loading">Cargando sonidos...</div>;

  return (
    <div className="biblioteca-container">
      <div className="biblioteca-header">
        <h2>Biblioteca FX</h2>
        {canEdit && (
          <button
            className="biblioteca-btn-agregar"
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              setFormData({ nombre_sonido: "", url_sonidos: "", url_img: "" });
              setAudioFile(null);
              setImagenFile(null);
            }}
          >
            + Agregar Sonido
          </button>
        )}
      </div>

      {sonidos.length === 0 ? (
        <div className="biblioteca-empty">
          <h3>No hay sonidos disponibles</h3>
          <p>Agrega tu primer sonido para comenzar</p>
        </div>
      ) : (
        <div className="biblioteca-grid">
          {sonidos.map((sonido) => (
            <div key={sonido.id_sonido} className="biblioteca-card">
              <div
                className="biblioteca-card-play"
                onClick={() => handlePlaySound(sonido)}
              >
                ▶
              </div>
              <h3 className="biblioteca-card-title">{sonido.nombre_sonido}</h3>
              <p className="biblioteca-card-duration">Duración: 0:25</p>
              {canEdit && (
                <div className="biblioteca-card-actions">
                  <button
                    className="biblioteca-card-edit"
                    onClick={() => handleEdit(sonido)}
                  >
                    ✎
                  </button>
                  <button
                    className="biblioteca-card-delete"
                    onClick={() => handleDelete(sonido.id_sonido)}
                  >
                    ×
                  </button>
                </div>
              )}
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
        <div className="biblioteca-modal" onClick={() => setShowModal(false)}>
          <div
            className="biblioteca-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingId ? "Editar Sonido" : "Nuevo Sonido"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="biblioteca-form-group">
                <label>Nombre del Sonido *</label>
                <input
                  type="text"
                  value={formData.nombre_sonido}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_sonido: e.target.value })
                  }
                  required
                />
              </div>

              <div className="biblioteca-form-group">
                <label>Audio del Sonido</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    setAudioFile(e.target.files[0]);
                    setFormData({ ...formData, url_sonidos: "" });
                  }}
                />
                {audioFile && (
                  <p className="biblioteca-form-success">
                    Archivo seleccionado: {audioFile.name}
                  </p>
                )}
              </div>

              <div className="biblioteca-form-group">
                <label>O ingresa URL del audio</label>
                <input
                  type="text"
                  value={formData.url_sonidos}
                  onChange={(e) => {
                    setFormData({ ...formData, url_sonidos: e.target.value });
                    setAudioFile(null);
                  }}
                  placeholder="https://ejemplo.com/sonido.mp3"
                  disabled={audioFile !== null}
                />
              </div>

              <div className="biblioteca-form-group">
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
                  <p className="biblioteca-form-success">
                    Archivo seleccionado: {imagenFile.name}
                  </p>
                )}
              </div>

              <div className="biblioteca-form-group">
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

              <div className="biblioteca-modal-buttons">
                <button type="submit" className="biblioteca-btn-submit">
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  className="biblioteca-btn-cancel"
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

export default Biblioteca;
