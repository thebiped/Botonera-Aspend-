"use client";

import { useState, useEffect, useRef } from "react";
import "../assets/programas.css";
import AudioPlayer from "./AudioPlayer";

const handleEditSonido = (sonido) => {
  alert(`Editando sonido: ${sonido.nombre_sonido}`);
};

function Programas({ user, apiUrl }) {
  const [programas, setProgramas] = useState([]);
  const [sonidos, setSonidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAccionModal, setShowAccionModal] = useState(false);
  const [showAgregarSonidoModal, setShowAgregarSonidoModal] = useState(false);
  const [showAsignarUsuarioModal, setShowAsignarUsuarioModal] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [programaSonidos, setProgramaSonidos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    horario: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [nuevoSonido, setNuevoSonido] = useState({
    nombre_sonido: "",
    archivo: null,
    url_sonidos: "",
    imagen: null,
    url_img: "",
  });

  const audioRef = useRef(null);
  const canAdmin = user.tipo === "admin";

  useEffect(() => {
    fetchProgramas();
    fetchSonidos();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (currentlyPlaying && audioRef.current) {
      audioRef.current.src = currentlyPlaying.url_sonidos;
      audioRef.current.load();
      audioRef.current.play().catch((e) =>
        console.error("Error al reproducir audio:", e)
      );
    }
  }, [currentlyPlaying]);

  const fetchProgramas = async () => {
    try {
      const res = await fetch(`${apiUrl}/programas`);
      const data = await res.json();
      if (res.ok) setProgramas(data);
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
      if (res.ok) setSonidos(data);
    } catch (err) {
      console.error("Error al obtener sonidos:", err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${apiUrl}/usuarios`);
      const data = await res.json();
      if (res.ok) setUsuarios(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  const fetchProgramaSonidos = async (programaId) => {
    try {
      const res = await fetch(`${apiUrl}/programas/${programaId}/sonidos`);
      const data = await res.json();
      if (res.ok) setProgramaSonidos(data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAdmin) {
      alert("Solo los administradores pueden crear o editar programas.");
      return;
    }

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
          const updatedPrograma = await (
            await fetch(`${apiUrl}/programas/${editingId}`)
          ).json();
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
    if (!canAdmin) {
      alert("Solo los administradores pueden eliminar programas.");
      return;
    }
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
    if (!canAdmin) {
      alert("Solo los administradores pueden editar programas.");
      return;
    }
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
      if (audioRef.current.paused) audioRef.current.play();
      else audioRef.current.pause();
    } else {
      setCurrentlyPlaying(sonido);
    }
  };

  const handleRemoveSonido = async (sonidoId) => {
    if (!canAdmin) {
      alert("Solo los administradores pueden quitar sonidos.");
      return;
    }
    try {
      const res = await fetch(
        `${apiUrl}/programas/${selectedPrograma.id_programa}/sonidos/${sonidoId}`,
        { method: "DELETE" }
      );
      if (res.ok) fetchProgramaSonidos(selectedPrograma.id_programa);
      else {
        const data = await res.json();
        alert(data.error || "Error al quitar el sonido");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const handleAgregarSonido = async (e) => {
    e.preventDefault();
    if (!canAdmin) return alert("Solo los administradores pueden agregar sonidos.");

    const formData = new FormData();
    formData.append("nombre_sonido", nuevoSonido.nombre_sonido);
    if (nuevoSonido.archivo) formData.append("audio", nuevoSonido.archivo);
    if (nuevoSonido.imagen) formData.append("imagen", nuevoSonido.imagen);
    formData.append("url_sonidos", nuevoSonido.url_sonidos);
    formData.append("url_img", nuevoSonido.url_img);

    try {
      const res = await fetch(`${apiUrl}/sonidos`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Sonido agregado correctamente");
        fetchProgramaSonidos(selectedPrograma.id_programa);
        setShowAgregarSonidoModal(false);
        setNuevoSonido({
          nombre_sonido: "",
          archivo: null,
          url_sonidos: "",
          imagen: null,
          url_img: "",
        });
      } else {
        alert("Error al agregar sonido");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor");
    }
  };

  const handleAsignarUsuario = async (programaId, usuarioId) => {
    try {
      const res = await fetch(`${apiUrl}/programas/${programaId}/asignar-usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Usuario asignado correctamente");
        setShowAsignarUsuarioModal(false);
      } else {
        alert(data.error || "Error al asignar usuario");
      }
    } catch (err) {
      console.error("Error al asignar usuario:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  if (loading) return <div className="loading">Cargando programas...</div>;

  const ProgramasList = () => (
    <>
      <div className="programas-header">
        <h2>Programas</h2>
        {canAdmin && (
          <button
            className="programas-btn-agregar"
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
          <button
            onClick={() => {
              setView("list");
              setCurrentlyPlaying(null);
            }}
            className="back-button"
          >
            ← Volver
          </button>
          <h2>{selectedPrograma.nombre}</h2>
          <p className="creado-por">
            creado por {selectedPrograma.creador || "administrador"}
          </p>
        </div>

        {canAdmin && (
          <div className="programa-actions-detail">
            <button onClick={() => setShowAccionModal(true)}>Acción</button>
            <button
              onClick={() => setShowAgregarSonidoModal(true)}
              className="btn-add-sound"
            >
              Agregar Sonido
            </button>
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
                <p>duración: {sonido.duracion || "N/A"}</p>
              </div>
              {canAdmin && (
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

      {/* Modal acción programa */}
      {showAccionModal && (
        <div className="programas-modal" onClick={() => setShowAccionModal(false)}>
          <div
            className="programas-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Acción sobre {selectedPrograma.nombre}</h2>
            <p>¿Qué querés hacer con este programa?</p>
            <div className="programas-modal-buttons">
              <button onClick={() => handleEdit(selectedPrograma)}>
                Editar Programa
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(selectedPrograma.id_programa)}
              >
                Eliminar Programa
              </button>
              <button
                onClick={() => setShowAsignarUsuarioModal(true)}
                className="btn-asignar"
              >
                Asignar usuario
              </button>
              <button onClick={() => setShowAccionModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Usuario */}
      {showAsignarUsuarioModal && (
        <div className="modal-overlay" onClick={() => setShowAsignarUsuarioModal(false)}>
          <div
            className="modal-content modal-usuarios-mini"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Asignar usuario al programa</h3>
            {usuarios.length === 0 ? (
              <p style={{ color: "#aaa" }}>No hay usuarios disponibles</p>
            ) : (
              <ul className="usuarios-mini-list">
                {usuarios.map((u) => (
                  <li key={u.id_usuario} className="usuario-mini-item">
                    <div className="usuario-mini-info">
                      <span className="usuario-mini-nombre">{u.n_usuario}</span>
                      <span className="usuario-mini-email">{u.gmail}</span>
                    </div>
                    <button
                      className="btn-asignar-mini"
                      onClick={() =>
                        handleAsignarUsuario(selectedPrograma.id_programa, u.id_usuario)
                      }
                    >
                      Asignar
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="btn-cancel"
              onClick={() => setShowAsignarUsuarioModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal agregar sonido */}
      {showAgregarSonidoModal && (
        <div
          className="biblioteca-modal"
          onClick={() => setShowAgregarSonidoModal(false)}
        >
          <div
            className="biblioteca-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingId ? "Editar Sonido" : "Nuevo Sonido"}</h2>
            <form onSubmit={handleAgregarSonido}>
              <div className="biblioteca-form-group">
                <label>Nombre del Sonido *</label>
                <input
                  type="text"
                  value={nuevoSonido.nombre_sonido}
                  onChange={(e) =>
                    setNuevoSonido({
                      ...nuevoSonido,
                      nombre_sonido: e.target.value,
                    })
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
                    setNuevoSonido({
                      ...nuevoSonido,
                      archivo: e.target.files[0],
                      url_sonidos: "",
                    });
                  }}
                />
                {nuevoSonido.archivo && (
                  <p className="biblioteca-form-success">
                    Archivo seleccionado: {nuevoSonido.archivo.name}
                  </p>
                )}
              </div>

              <div className="biblioteca-form-group">
                <label>O ingresa URL del audio</label>
                <input
                  type="text"
                  value={nuevoSonido.url_sonidos}
                  onChange={(e) => {
                    setNuevoSonido({
                      ...nuevoSonido,
                      url_sonidos: e.target.value,
                      archivo: null,
                    });
                  }}
                  placeholder="https://ejemplo.com/sonido.mp3"
                  disabled={nuevoSonido.archivo !== null}
                />
              </div>

              <div className="biblioteca-form-group">
                <label>Imagen del Sonido</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setNuevoSonido({
                      ...nuevoSonido,
                      imagen: e.target.files[0],
                      url_img: "",
                    });
                  }}
                />
                {nuevoSonido.imagen && (
                  <p className="biblioteca-form-success">
                    Archivo seleccionado: {nuevoSonido.imagen.name}
                  </p>
                )}
              </div>

              <div className="biblioteca-form-group">
                <label>O ingresa URL de la imagen</label>
                <input
                  type="text"
                  value={nuevoSonido.url_img}
                  onChange={(e) => {
                    setNuevoSonido({
                      ...nuevoSonido,
                      url_img: e.target.value,
                      imagen: null,
                    });
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={nuevoSonido.imagen !== null}
                />
              </div>

              <div className="biblioteca-modal-buttons">
                <button type="submit" className="biblioteca-btn-submit">
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  className="biblioteca-btn-cancel"
                  onClick={() => setShowAgregarSonidoModal(false)}
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
