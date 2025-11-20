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
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [showVerSonidosModal, setShowVerSonidosModal] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [programaSonidos, setProgramaSonidos] = useState([]);
  const [view, setView] = useState("list");
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [nuevoSonido, setNuevoSonido] = useState({
    nombre_sonido: "",
    archivo: null,
    url_sonidos: "",
    imagen: null,
    url_img: "",
  });
  const [activeTab, setActiveTab] = useState("sonidos");

  // **ESTADOS NUEVOS PARA ARCHIVOS**
  const [audioFile, setAudioFile] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);

  const audioRef = useRef(null);
  const canAdmin = user.tipo === "admin";
  const isOperador = user.tipo === "operador";

  useEffect(() => {
    fetchProgramas();
    fetchSonidos();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (currentlyPlaying && audioRef.current) {
      audioRef.current.src = currentlyPlaying.url_sonidos;
      audioRef.current.load();
      audioRef.current.play().catch((e) => console.error(e));
    }
  }, [currentlyPlaying]);

  const fetchProgramas = async () => {
    try {
      const res = await fetch(`${apiUrl}/programas`);
      const data = await res.json();
      if (res.ok) setProgramas(data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${apiUrl}/usuarios`);
      const data = await res.json();
      if (res.ok) setUsuarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProgramaSonidos = async (programaId) => {
    try {
      const res = await fetch(`${apiUrl}/programas/${programaId}/sonidos`);
      const data = await res.json();
      if (res.ok) {
        if (isOperador) {
          setProgramaSonidos(
            data.filter((s) => s.creadorId === user.id_usuario)
          );
        } else if (canAdmin) {
          setProgramaSonidos(
            data.filter((s) => s.creadorId === user.id_usuario)
          );
        } else {
          setProgramaSonidos(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
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
    const sonido = programaSonidos.find((s) => s.id_sonido === sonidoId);
    if (!sonido) return;
    if (!canAdmin && !(isOperador && sonido.creadorId === user.id_usuario)) {
      return alert("No tenés permisos para eliminar este sonido.");
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
      console.error(err);
      alert("No se pudo conectar al servidor");
    }
  };

  const handleAgregarSonido = async (e) => {
    e.preventDefault();
    if (!(canAdmin || isOperador))
      return alert("No tenés permisos para agregar sonidos.");
    if (!user?.id_usuario || !selectedPrograma?.id_programa)
      return alert("Error: falta ID de usuario o programa.");

    const formData = new FormData();
    formData.append("nombre_sonido", nuevoSonido.nombre_sonido);
    if (nuevoSonido.archivo) formData.append("audio", nuevoSonido.archivo);
    if (nuevoSonido.imagen) formData.append("imagen", nuevoSonido.imagen);
    formData.append("url_sonidos", nuevoSonido.url_sonidos);
    formData.append("url_img", nuevoSonido.url_img);
    formData.append("programaId", selectedPrograma.id_programa);
    formData.append("creadorId", user.id_usuario);

    try {
      const res = await fetch(`${apiUrl}/sonidos`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Sonido agregado correctamente");
        fetchProgramaSonidos(selectedPrograma.id_programa);
        // Reset solo al agregar correctamente
        setNuevoSonido({
          nombre_sonido: "",
          archivo: null,
          url_sonidos: "",
          imagen: null,
          url_img: "",
        });
        setAudioFile(null);
        setImagenFile(null);
      } else {
        const data = await res.json();
        alert(data.error || "Error al agregar sonido");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor");
    }
  };

  const handleAsignarUsuario = async (usuarioId) => {
    try {
      const res = await fetch(
        `${apiUrl}/programas/${selectedPrograma.id_programa}/asignar-usuario`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId }),
        }
      );
      const data = await res.json();
      if (res.ok) alert("Usuario asignado correctamente");
      else alert(data.error || "Error al asignar usuario");
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar al servidor");
    }
  };

  if (loading) return <div className="loading">Cargando programas...</div>;

  const ProgramasList = () => (
    <>
      <div className="programas-header">
        <h2>Programas</h2>
      </div>
      {programas.length === 0 ? (
        <div className="programas-empty">
          <h3>No hay programas disponibles</h3>
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
        <button
          onClick={() => {
            setView("list");
            setCurrentlyPlaying(null);
          }}
          className="back-button"
        >
          ← Volver
        </button>
        <div className="sonidos-view-header-con">
          <div className="sonidos-view-header-content">
            <h2>{selectedPrograma.nombre}</h2>
            <p className="creado-por">
              creado por {selectedPrograma.creador || "administrador"}
            </p>
          </div>
          {canAdmin && (
            <>
              <button
                onClick={() => setShowAsignarModal(true)}
                className="btn-asignar"
              >
                Asignar
              </button>
              <button
                onClick={() => setShowVerSonidosModal(true)}
                className="btn-asignar"
              >
                Ver Sonidos
              </button>
            </>
          )}
        </div>
      </div>

      {programaSonidos.length === 0 ? (
        <div className="programas-empty">
          <h3>No hay sonidos asignados</h3>
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
                <p>Asignado por: {sonido.creador || "admin"}</p>
              </div>
              {(canAdmin || (isOperador && sonido.creadorId === user.id_usuario)) && (
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

      {/* MODALES */}
      {(showAsignarModal || showVerSonidosModal) && (
        <div
          className="programas-modal"
          onClick={() => {
            setShowAsignarModal(false);
            setShowVerSonidosModal(false);
            setNuevoSonido({
              nombre_sonido: "",
              archivo: null,
              url_sonidos: "",
              imagen: null,
              url_img: "",
            });
            setAudioFile(null);
            setImagenFile(null);
          }}
        >
          <div
            className="programas-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL ASIGNAR */}
            {showAsignarModal && (
              <>
                <div className="programas-modal-tabs">
                  <button
                    className={activeTab === "sonidos" ? "active" : ""}
                    onClick={() => setActiveTab("sonidos")}
                  >
                    Asignar Sonidos
                  </button>
                  <button
                    className={activeTab === "usuarios" ? "active" : ""}
                    onClick={() => setActiveTab("usuarios")}
                  >
                    Asignar Usuarios
                  </button>
                </div>

                <div className="programas-modal-tab-content">
                  {activeTab === "sonidos" && (canAdmin || isOperador) && (
                    <form onSubmit={handleAgregarSonido}>
                      <div className="programas-form-group">
                        <label>Nombre del Sonido *</label>
                        <input
                          type="text"
                          value={nuevoSonido.nombre_sonido}
                          onChange={(e) =>
                            setNuevoSonido((prev) => ({
                              ...prev,
                              nombre_sonido: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="programas-form-group">
                        <label>Archivo de audio</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            setAudioFile(e.target.files[0] || null);
                            setNuevoSonido((prev) => ({
                              ...prev,
                              archivo: e.target.files[0] || null,
                              url_sonidos: "",
                            }));
                          }}
                        />
                        {audioFile && (
                          <p className="programas-form-success">
                            Archivo seleccionado: {audioFile.name}
                          </p>
                        )}
                      </div>

                      <div className="programas-form-group">
                        <label>O URL de audio</label>
                        <input
                          type="text"
                          value={nuevoSonido.url_sonidos}
                          onChange={(e) =>
                            setNuevoSonido((prev) => ({
                              ...prev,
                              url_sonidos: e.target.value,
                              archivo: null,
                            }))
                          }
                          placeholder="https://ejemplo.com/sonido.mp3"
                          disabled={audioFile !== null}
                        />
                      </div>

                      <div className="programas-form-group">
                        <label>Imagen</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            setImagenFile(e.target.files[0] || null);
                            setNuevoSonido((prev) => ({
                              ...prev,
                              imagen: e.target.files[0] || null,
                              url_img: "",
                            }));
                          }}
                        />
                        {imagenFile && (
                          <p className="programas-form-success">
                            Archivo seleccionado: {imagenFile.name}
                          </p>
                        )}
                      </div>

                      <div className="programas-form-group">
                        <label>O URL de imagen</label>
                        <input
                          type="text"
                          value={nuevoSonido.url_img}
                          onChange={(e) =>
                            setNuevoSonido((prev) => ({
                              ...prev,
                              url_img: e.target.value,
                              imagen: null,
                            }))
                          }
                          placeholder="https://ejemplo.com/imagen.jpg"
                          disabled={imagenFile !== null}
                        />
                      </div>

                      <div className="programas-modal-buttons">
                        <button type="submit" className="btn-submit">
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => {
                            setNuevoSonido({
                              nombre_sonido: "",
                              archivo: null,
                              url_sonidos: "",
                              imagen: null,
                              url_img: "",
                            });
                            setAudioFile(null);
                            setImagenFile(null);
                            setShowAsignarModal(false);
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}

                  {/* PESTAÑA USUARIOS */}
                  {activeTab === "usuarios" && canAdmin && (
                    <ul className="programas-usuarios-list">
                      {usuarios
                        .filter((u) => u.tipo !== "admin")
                        .map((u) => (
                          <li
                            key={u.id_usuario}
                            className="programas-usuario-item"
                          >
                            <div className="usuario-avatar">👤</div>
                            <div className="usuario-info">
                              <h3 className="usuario-name">{u.n_usuario}</h3>
                              <p className="usuario-email">{u.gmail}</p>
                              <p className="usuario-rol">Rol: {u.tipo}</p>
                            </div>
                            <div className="usuario-actions">
                              <button
                                className="usuario-btn-asignar"
                                onClick={() =>
                                  handleAsignarUsuario(u.id_usuario)
                                }
                              >
                                Asignar al programa
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {/* MODAL VER SONIDOS */}
            {showVerSonidosModal && (
              <>
                <h2>Sonidos del Programa</h2>
                <p>
                  Lista de sonidos asignados a este programa. Puedes editar o
                  eliminar cada sonido.
                </p>
                {programaSonidos.length === 0 ? (
                  <div className="programas-empty">
                    <h3>No hay sonidos asignados a este programa</h3>
                  </div>
                ) : (
                  <ul className="sonidos-list">
                    {programaSonidos.map((sonido) => (
                      <li key={sonido.id_sonido} className="sonidos-list-item">
                        <div>
                          <strong>{sonido.nombre_sonido}</strong>
                          <p>Asignado por: {sonido.creador || "admin"}</p>
                        </div>
                        {(canAdmin || (isOperador && sonido.creadorId === user.id_usuario)) && (
                          <div className="programa-actions-detail">
                            <button
                              className="btn-submit"
                              onClick={() => handleEditSonido(sonido)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() =>
                                handleRemoveSonido(sonido.id_sonido)
                              }
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="programas-modal-buttons">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowVerSonidosModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="programas-container">
      {view === "list" ? <ProgramasList /> : <SonidosView />}
    </div>
  );
}

export default Programas;
