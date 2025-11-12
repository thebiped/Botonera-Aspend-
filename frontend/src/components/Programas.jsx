"use client";

import { useState, useEffect, useRef } from "react";
import "../assets/programas.css";
import AudioPlayer from "./AudioPlayer";

// Placeholder for a function to edit a sound
const handleEditSonido = (sonido) => {
  alert(`Editando sonido: ${sonido.nombre_sonido}`);
};

function Programas({ user, apiUrl }) {
  const [programas, setProgramas] = useState([]);
  const [sonidos, setSonidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [programaSonidos, setProgramaSonidos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    horario: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list"); // 'list' or 'sounds'
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    fetchProgramas();
    fetchSonidos();
  }, []);

  useEffect(() => {
    if (currentlyPlaying && audioRef.current) {
      audioRef.current.src = currentlyPlaying.url_sonidos;
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Error al reproducir audio:", e));
    }
  }, [currentlyPlaying]);

  const fetchProgramas = async () => {
    try {
      const res = await fetch(`${apiUrl}/programas`);
      const data = await res.json();
      if (res.ok) {
        setProgramas(data);
      }
    } catch (err) {
      console.error("Error al obtener programas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSonidos = async () => {
    try {
      const res = await fetch(`${apiUrl}/sonidos`);
      const data = await res.json();
      if (res.ok) {
        setSonidos(data);
      }
    } catch (err) {
      console.error("Error al obtener sonidos:", err);
    }
  };

  const fetchProgramaSonidos = async (programaId) => {
    try {
      const res = await fetch(`${apiUrl}/programas/${programaId}/sonidos`);
      const data = await res.json();
      if (res.ok) {
        setProgramaSonidos(data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? `/programas/${editingId}` : "/programas";
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        fetchProgramas();
        setShowModal(false);
        setFormData({ nombre: "", descripcion: "", horario: "" });
        setEditingId(null);
        if (editingId) {
          const updatedPrograma = await (await fetch(`${apiUrl}/programas/${editingId}`)).json();
          setSelectedPrograma(updatedPrograma);
        }
      } else {
        alert(data.error || "Error al guardar el programa");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este programa?")) return;
    try {
      const res = await fetch(`${apiUrl}/programas/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProgramas();
        setView("list");
        setSelectedPrograma(null);
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar el programa");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const handleEdit = (programa) => {
    setFormData({
      nombre: programa.nombre,
      descripcion: programa.descripcion || "",
      horario: programa.horario || "",
    });
    setEditingId(programa.id_programa);
    setShowModal(true);
  };

  const handleShowSonidos = (programa) => {
    setSelectedPrograma(programa);
    fetchProgramaSonidos(programa.id_programa);
    setView("sounds");
  };

  const handlePlaySound = (sonido) => {
    if (currentlyPlaying && currentlyPlaying.id_sonido === sonido.id_sonido) {
      // If clicking the same sound, toggle play/pause
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } else {
      setCurrentlyPlaying(sonido);
    }
  };

  const handleRemoveSonido = async (sonidoId) => {
    try {
      const res = await fetch(
        `${apiUrl}/programas/${selectedPrograma.id_programa}/sonidos/${sonidoId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchProgramaSonidos(selectedPrograma.id_programa);
      } else {
        const data = await res.json();
        alert(data.error || "Error al quitar el sonido");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const canEdit = user.tipo === "admin" || user.tipo === "operador";

  if (loading) return <div className="loading">Cargando programas...</div>;

  const ProgramasList = () => (
    <>
      <div className="programas-header">
        <h2>Programas</h2>
        {canEdit && (
          <button
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              setFormData({ nombre: "", descripcion: "", horario: "" });
            }}
          >
            + Nuevo Programa
          </button>
        )}
      </div>
      {programas.length === 0 ? (
        <div className="programas-empty">
          <h3>No hay programas disponibles</h3>
          <p>Agrega tu primer programa para comenzar</p>
        </div>
      ) : (
        <div className="programas-grid">
          {programas.map((programa) => (
            <div
              key={programa.id_programa}
              className="programa-card"
              onDoubleClick={() => handleShowSonidos(programa)}
            >
              <h3>{programa.nombre}</h3>
              <p>{programa.descripcion}</p>
              <div className="programa-horario">
                <p>
                  <strong>Horario:</strong>{" "}
                  <span>{programa.horario || "No especificado"}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const SonidosView = () => (
    <div className="sonidos-view-container">
      <div className="sonidos-view-header">
        <div>
          <button onClick={() => { setView('list'); setCurrentlyPlaying(null); }} className="back-button">← Volver</button>
          <h2>{selectedPrograma.nombre}</h2>
          <p className="creado-por">creado por {selectedPrograma.creador || 'administrador'}</p>
        </div>
        {canEdit && (
          <div className="programa-actions-detail">
            <button onClick={() => handleEdit(selectedPrograma)}>Editar Programa</button>
            <button onClick={() => handleDelete(selectedPrograma.id_programa)} className="btn-delete">Eliminar Programa</button>
          </div>
        )}
      </div>

      {programaSonidos.length === 0 ? (
        <div className="programas-empty">
          <h3>No hay sonidos asignados</h3>
          <p>Agrega sonidos para verlos aquí</p>
        </div>
      ) : (
        <div className="sonidos-grid">
          {programaSonidos.map((sonido) => (
            <div key={sonido.id_sonido} className="sonido-card">
              <div
                className="sonido-card-play-icon"
                onClick={() => handlePlaySound(sonido)}
              >
                ▶
              </div>
              <div className="sonido-card-info">
                <strong>{sonido.nombre_sonido}</strong>
                <p>duracion: {sonido.duracion || "N/A"}</p>
              </div>
              {canEdit && (
                <div className="sonido-card-actions">
                  <button
                    onClick={() => handleEditSonido(sonido)}
                    className="sonido-card-edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleRemoveSonido(sonido.id_sonido)}
                    className="sonido-card-delete"
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
    </div>
  );

  return (
    <div className="programas-container">
      {view === "list" ? <ProgramasList /> : <SonidosView />}

      {showModal && (
        <div className="programas-modal" onClick={() => setShowModal(false)}>
          <div
            className="programas-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingId ? "Editar Programa" : "Nuevo Programa"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="programas-form-group">
                <label>Nombre del Programa *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="programas-form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="programas-form-group">
                <label>Horario</label>
                <input
                  type="text"
                  value={formData.horario}
                  onChange={(e) =>
                    setFormData({ ...formData, horario: e.target.value })
                  }
                  placeholder="Ej: Lunes a Viernes 10:00 - 12:00"
                />
              </div>
              <div className="programas-modal-buttons">
                <button type="submit" className="btn-submit">
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
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

export default Programas;
