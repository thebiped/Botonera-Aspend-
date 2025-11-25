
"use client";

import { useState, useEffect, useRef } from "react";
import "../assets/programas.css";
import AudioPlayer from "./AudioPlayer"; // Asegúrate que la ruta sea correcta

function Programas({ user, apiUrl }) {
  const [programas, setProgramas] = useState([]);
  const [sonidos, setSonidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales y navegación
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Modal de Edición de SONIDO
  // [NUEVO] Estado para el Modal de Creación de Programa
  const [showNewProgramaModal, setShowNewProgramaModal] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [programaSonidos, setProgramaSonidos] = useState([]);
  const [view, setView] = useState("list"); // 'list' o 'sounds'

  // Control de Tabs
  const [activeTab, setActiveTab] = useState("sonidos"); // Tabs para el Modal 'Asignar'
  const [detailTab, setDetailTab] = useState("sounds"); // Tabs para el Modal 'Detalle'

  // Reproductor
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [usuariosAsignados, setUsuariosAsignados] = useState([]);
  // Formulario nuevo/edición sonido
  const [nuevoSonido, setNuevoSonido] = useState({
    nombre_sonido: "",
    archivo: null,
    url_sonidos: "",
    imagen: null,
    url_img: "",
  });

  // [NUEVO] Estado para el formulario de Creación de Programa
  const [newProgramaData, setNewProgramaData] = useState({
    nombre: "",
    descripcion: "",
    horario: "",
  });

  // Edición
  const [editingSonido, setEditingSonido] = useState(null); // Sonido a editar
  const [editingPrograma, setEditingPrograma] = useState({
    nombre: "",
    descripcion: "",
    horario: "",
  });

  // Archivos para subir
  const [audioFile, setAudioFile] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);

  // Permisos: Usamos un fallback para id_usuario
  const userId = user?.id_usuario || user?.id;
  const canAdmin = user?.tipo === "admin";
  const isOperador = user?.tipo === "operador";
  const isProductor = user?.tipo === "productor";

  // --- Ciclo de Vida y Fetching ---

  useEffect(() => {
    fetchProgramas();
    if (userId) {
      fetchSonidos();
    }
    fetchUsuarios();
  }, [userId]);

  /**
   * Modificado:
   * Los productores solo traen sus programas asignados.
   * Admin/Operador traen todos los programas.
   */
  const fetchProgramas = async () => {
    try {
      let url = `${apiUrl}/programas`;

      // Si es productor, pide solo los programas asignados
      if (isProductor && userId) {
        url = `${apiUrl}/programas?id_usuario=${userId}`;
      }if (isOperador && userId) {
        url = `${apiUrl}/programas?id_usuario=${userId}`;
      }
      

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setProgramas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSonidos = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${apiUrl}/sonidos?id_usuario=${userId}`);
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
        setProgramaSonidos(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowSonidos = async (programa) => {
  setSelectedPrograma(programa);
  setView("sounds");

  try {
    const res = await fetch(`${apiUrl}/programas/${programa.id_programa}/usuarios`);
    const data = await res.json();

    setUsuariosAsignados(data.usuarios || []); // <--- IMPORTANTE
  } catch (err) {
    console.error(err);
    setUsuariosAsignados([]);
  }
};


  // --- Manejo de Programas (CRUD) ---

  // [NUEVA] Función para crear un nuevo programa
  const handleCreatePrograma = async (e) => {
    e.preventDefault();
    if (!canAdmin)
      return alert("No tienes permisos para crear nuevos programas.");
    if (!newProgramaData.nombre)
      return alert("El nombre del programa es obligatorio.");

    try {
      const res = await fetch(`${apiUrl}/programas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Incluye el ID del usuario creador (admin) en el body si tu backend lo requiere
        body: JSON.stringify({
          ...newProgramaData,
          id_creador: userId,
          user_tipo: user?.tipo,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Programa creado correctamente");
        fetchProgramas(); // Recarga la lista global de programas
        setShowNewProgramaModal(false); // Cierra el modal
        setNewProgramaData({ nombre: "", descripcion: "", horario: "" }); // Limpia el formulario
      } else {
        alert(data.error || "Error al crear el programa");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar al servidor");
    }
  };

  // Función para editar el programa
  const handleEditPrograma = async (e) => {
    e.preventDefault();
    if (!canAdmin) return alert("No tienes permisos para editar programas.");
    if (!selectedPrograma) return;

    try {
      const res = await fetch(
        `${apiUrl}/programas/${selectedPrograma.id_programa}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingPrograma),
        }
      );
      const data = await res.json();

      if (res.ok) {
        alert("Programa actualizado correctamente");
        fetchProgramas(); // Recarga la lista global de programas
        setSelectedPrograma({ ...selectedPrograma, ...editingPrograma }); // Actualiza el programa seleccionado
        setShowDetailModal(false);
      } else {
        alert(data.error || "Error al actualizar el programa");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar al servidor");
    }
  };

  // Función para eliminar el programa
  const handleDeletePrograma = async () => {
    if (!canAdmin )
      return alert("No tienes permisos para eliminar programas.");
    if (!selectedPrograma) return;

    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar el programa "${selectedPrograma.nombre}"? Esta acción es irreversible.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `${apiUrl}/programas/${selectedPrograma.id_programa}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        alert("Programa eliminado correctamente.");
        setView("list"); // Vuelve a la lista
        setSelectedPrograma(null);
        fetchProgramas(); // Recarga la lista de programas
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar el programa");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar al servidor");
    }
  };

  // --- Manejo de Sonidos (CRUD) ---

  // (Funciones de Sonidos como handleRemoveSonido, handleEditSonido, handleUpdateSonido, handleAgregarSonido, handleAsignarUsuario, y resetSonidoForm se mantienen igual)

  const handleRemoveSonido = async (sonidoId) => {
    // Si no es admin, solo puede eliminar si es operador y el sonido fue subido por él
    const sonido = programaSonidos.find((s) => s.id_sonido === sonidoId);
    if (!(canAdmin || (isOperador && sonido?.id_usuario === userId))) {
      return alert("No tienes permisos para eliminar este sonido.");
    }

    if (
      !window.confirm("¿Seguro que quieres eliminar este sonido del programa?")
    )
      return;

    try {
      // Envía id_usuario como Query Parameter para la validación del backend
      const res = await fetch(
        `${apiUrl}/programas/${selectedPrograma.id_programa}/sonidos/${sonidoId}?id_usuario=${userId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchProgramaSonidos(selectedPrograma.id_programa);
        alert("Sonido quitado del programa correctamente.");
      } else {
        const data = await res.json();
        alert(data.error || "Error al quitar el sonido");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar al servidor");
    }
  };

  // Abrir Modal de Edición de SONIDO
  const handleEditSonido = (sonido) => {
    // Si no es admin, solo puede editar si es operador y el sonido fue subido por él
    if (!(canAdmin || (isOperador && sonido.id_usuario === userId))) {
      return alert("No tienes permisos para editar este sonido.");
    }

    setEditingSonido(sonido);
    // Carga los datos del sonido en el formulario
    setNuevoSonido({
      nombre_sonido: sonido.nombre_sonido,
      archivo: null, // Los archivos se manejan por separado
      url_sonidos: sonido.url_sonidos || "",
      imagen: null,
      url_img: sonido.url_img || "",
    });
    setAudioFile(null);
    setImagenFile(null);
    setShowEditModal(true);
  };

  // Manejar la actualización del sonido (PUT)
  const handleUpdateSonido = async (e) => {
    e.preventDefault();
    if (!editingSonido) return;

    if (!(canAdmin || (isOperador && editingSonido.id_usuario === userId)))
      return alert("No tenés permisos para editar este sonido.");

    const formData = new FormData();
    formData.append("nombre_sonido", nuevoSonido.nombre_sonido);

    // Incluye el ID del usuario que edita para la validación del backend
    formData.append("id_usuario", userId);

    // Audio: Envía archivo nuevo o URL existente/modificada
    if (audioFile) formData.append("audio", audioFile);
    else if (nuevoSonido.url_sonidos)
      formData.append("url_sonidos", nuevoSonido.url_sonidos);
    else formData.append("url_sonidos", ""); // Si se vació, enviar vacío para borrar la URL antigua

    // Imagen: Envía archivo nuevo o URL existente/modificada
    if (imagenFile) formData.append("imagen", imagenFile);
    else if (nuevoSonido.url_img)
      formData.append("url_img", nuevoSonido.url_img);
    else formData.append("url_img", ""); // Si se vació, enviar vacío para borrar la URL antigua

    try {
      const res = await fetch(`${apiUrl}/sonidos/${editingSonido.id_sonido}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Sonido actualizado correctamente");
        fetchProgramaSonidos(selectedPrograma.id_programa); // Recarga la lista de sonidos
        setShowEditModal(false);
        setEditingSonido(null);
      } else {
        alert(data.error || "Error al actualizar el sonido");
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

    if (!userId || !selectedPrograma?.id_programa)
      return alert("Error: falta ID de usuario o programa.");

    const formData = new FormData();
    formData.append("nombre_sonido", nuevoSonido.nombre_sonido);

    if (nuevoSonido.archivo) formData.append("audio", nuevoSonido.archivo);
    else if (nuevoSonido.url_sonidos)
      formData.append("url_sonidos", nuevoSonido.url_sonidos);

    if (nuevoSonido.imagen) formData.append("imagen", nuevoSonido.imagen);
    else if (nuevoSonido.url_img)
      formData.append("url_img", nuevoSonido.url_img);

    formData.append("id_usuario", userId);

    let nuevoSonidoId = null;

    try {
      // 1. CREAR EL SONIDO EN LA TABLA 'sonidos'
      const resSonido = await fetch(`${apiUrl}/sonidos`, {
        method: "POST",
        body: formData,
      });
      if (!resSonido.ok) {
        const data = await resSonido.json();
        throw new Error(data.error || "Error al subir el archivo de sonido");
      }

      const dataSonido = await resSonido.json();
      nuevoSonidoId = dataSonido.id_sonido; // Obtenemos el ID del sonido recién creado

      // 2. CREAR LA RELACIÓN EN LA TABLA 'programa_sonidos'
      const resRelacion = await fetch(
        `${apiUrl}/programas/${selectedPrograma.id_programa}/sonidos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_sonido: nuevoSonidoId }), // Usamos el ID devuelto
        }
      );

      if (!resRelacion.ok) {
        const data = await resRelacion.json();
        throw new Error(
          data.error || "Error al relacionar el sonido con el programa"
        );
      }

      alert("Sonido agregado y relacionado correctamente");
      fetchProgramaSonidos(selectedPrograma.id_programa);

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
    } catch (err) {
      console.error(err);
      alert(`Error al conectar con el servidor: ${err.message}`);
    }
  };
  const openAsignarUsuarios = async (programa) => {
  setSelectedPrograma(programa);

  try {
    const res = await fetch(
      `${apiUrl}/programas/${programa.id_programa}/usuarios`
    );
    const data = await res.json();

    setUsuariosAsignados(data); // <<--- CARGA REAL

    setShowAsignarModal(true);
  } catch (err) {
    console.log(err);
    alert("Error cargando usuarios asignados");
  }
};

  const handleAsignarUsuario = async (usuarioId) => {
  try {
    const res = await fetch(
      `${apiUrl}/programas/${selectedPrograma.id_programa}/usuarios`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuarioId }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Usuario asignado correctamente");

      // ACTUALIZAR LISTA SIN VOLVER A ABRIR MODAL
      setUsuariosAsignados(prev => [
        ...prev,
        { id_usuario: usuarioId }
      ]);
    } else {
      alert(data.error || "Error al asignar usuario");
    }
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar al servidor");
  }
};

  const handleDesasignarUsuario = async (usuarioId) => {
  try {
    const res = await fetch(
      `${apiUrl}/programas/${selectedPrograma.id_programa}/usuarios/${usuarioId}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      alert("Usuario desasignado correctamente");

      setUsuariosAsignados(prev =>
        prev.filter((u) => u.id_usuario !== usuarioId)
      );
    } else {
      alert("Error al desasignar usuario");
    }
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar al servidor");
  }
};


  // --- RENDER / Helpers ---

  // Función de reinicio de estado común para los modales
  const resetSonidoForm = () => {
    setNuevoSonido({
      nombre_sonido: "",
      archivo: null,
      url_sonidos: "",
      imagen: null,
      url_img: "",
    });
    setAudioFile(null);
    setImagenFile(null);
    setEditingSonido(null);
  };

  if (loading) return <div className="loading">Cargando programas...</div>;

  return (
    <div className="programas-container">
      {/* VISTA: LISTA DE PROGRAMAS */}
      {view === "list" && (
        <>
          <div className="programas-header">
            <h2>{isProductor || isOperador ? "Mis Programas Asignados" : "Programas"}</h2>
            {/* [NUEVO] Botón de Crear Programa (SOLO ADMIN) */}
            {canAdmin && (
              <button
                className="feo"
                onClick={() => setShowNewProgramaModal(true)}
              >
                + Crear Programa
              </button>
            )}
          </div>
          {programas.length === 0 ? (
            <div className="programas-empty">
              <h3>
                {isProductor || isOperador
                  ? "No tienes programas asignados."
                  : "No hay programas disponibles"}
              </h3>
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
      )}

      {/* VISTA: DETALLE DE SONIDOS */}
      {view === "sounds" && selectedPrograma && (
        <div className="sonidos-view-container">
          <div className="sonidos-view-header">
            <button
              onClick={() => {
                setView("list");
                setCurrentlyPlaying(null);
                setSelectedPrograma(null);
              }}
              className="back-button"
            >
              ← Volver
            </button>
            <div className="sonidos-view-header-con">
              <div className="sonidos-view-header-content">
                <h2>{selectedPrograma.nombre}</h2>
                <p className="creado-por">
                  creado por {selectedPrograma.creador || "admin"}
                </p>
              </div>
              {/* Los botones de AGREGAR/ASIGNAR/VER DETALLADA solo se muestran para Admin/Operador */}
              {(canAdmin) && (
                <div className="sonidos-view-actions">
                  {canAdmin && (
                    <button
                      onClick={() => {
                        setShowAsignarModal(true);
                        setActiveTab("usuarios");
                      }}
                      className="btn-asignar"
                    >
                      Asignar Usuarios
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAsignarModal(true);
                      setActiveTab("sonidos");
                    }}
                    className="btn-asignar"
                  >
                    Agregar Sonido
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(true); // [NUEVO] Abrir modal de detalle
                      setDetailTab("sounds");
                    }}
                    className="btn-asignar"
                  >
                    Ver Lista Detallada
                  </button>
                  {/* [NUEVO] Botón de Eliminar Programa */}
                  <button onClick={handleDeletePrograma} className="btn-delete">
                    Eliminar Programa
                  </button>
                </div>
              )}
              {(isOperador) && (
                <div className="sonidos-view-actions">
                  {canAdmin && (
                    <button
                      onClick={() => {
                        setShowAsignarModal(true);
                        setActiveTab("usuarios");
                      }}
                      className="btn-asignar"
                    >
                      Asignar Usuarios
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAsignarModal(true);
                      setActiveTab("sonidos");
                    }}
                    className="btn-asignar"
                  >
                    Agregar Sonido
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(true); // [NUEVO] Abrir modal de detalle
                      setDetailTab("sounds");
                    }}
                    className="btn-asignar"
                  >
                    Ver Lista Detallada
                  </button>
                  {/* [NUEVO] Botón de Eliminar Programa */}
                  
                </div>
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
                  {/* Lógica para mostrar la imagen y el icono de Play/Pause */}
                  <div
                    className="sonido-card-play-icon"
                    onClick={() => handlePlaySound(sonido)}
                  >
                    {sonido.url_img ? (
                      <>
                        <img
                          src={sonido.url_img}
                          alt={sonido.nombre_sonido}
                          className="sonido-card-img"
                        />
                        <span className="sonido-card-icon">
                          {currentlyPlaying?.id_sonido === sonido.id_sonido
                            ? "⏸"
                            : "▶"}
                        </span>
                      </>
                    ) : // Icono de texto si no hay imagen
                    currentlyPlaying?.id_sonido === sonido.id_sonido ? (
                      "⏸"
                    ) : (
                      "▶"
                    )}
                  </div>

                  <div className="sonido-card-info">
                    <strong>{sonido.nombre_sonido}</strong>
                    <p>Subido por usuario ID: {sonido.id_usuario}</p>
                  </div>

                  {/* Botones de acción rápida en la tarjeta: SOLO para Admin/Operador (o Productor que subió el sonido) */}
                  {(canAdmin ||
                    (isOperador && sonido.id_usuario === userId)) && (
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

          {/* COMPONENTE AUDIO PLAYER PARA MOSTRAR LA BARRA DE SONIDO */}
          {currentlyPlaying && (
            <AudioPlayer
              // Asume que AudioPlayer acepta un prop 'sonido' con la URL
              // y una función 'onClose' para cerrar el reproductor.
              sonido={{
                ...currentlyPlaying,
                url_sonido: currentlyPlaying.url_sonidos,
              }}
              isPlaying={true}
              onClose={() => setCurrentlyPlaying(null)}
            />
          )}

          {/* MODAL DE ASIGNAR / AGREGAR SONIDO */}
          {showAsignarModal && (canAdmin || isOperador) && (
            <div
              className="programas-modal"
              onClick={() => {
                setShowAsignarModal(false);
                resetSonidoForm();
              }}
            >
              <div
                className="programas-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="programas-modal-tabs">
                  <button
                    className={activeTab === "sonidos" ? "active" : ""}
                    onClick={() => setActiveTab("sonidos")}
                  >
                    Subir Sonido
                  </button>
                  {canAdmin && (
                    <button
                      className={activeTab === "usuarios" ? "active" : ""}
                      onClick={() => setActiveTab("usuarios")}
                    >
                      Asignar Usuarios
                    </button>
                  )}
                </div>

                <div className="programas-modal-tab-content">
                  {/* FORMULARIO DE SONIDOS */}
                  {activeTab === "sonidos" && (
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
                          autoFocus
                        />
                      </div>

                      <div className="programas-form-group">
                        <label>Archivo de audio (MP3/WAV)</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setAudioFile(file);
                            setNuevoSonido((prev) => ({
                              ...prev,
                              archivo: file,
                              url_sonidos: "",
                            }));
                          }}
                        />
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
                          placeholder="https://..."
                          disabled={!!audioFile}
                        />
                      </div>

                      <div className="programas-form-group">
                        <label>Imagen (Opcional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            setImagenFile(e.target.files[0]);
                            setNuevoSonido((prev) => ({
                              ...prev,
                              imagen: e.target.files[0],
                              url_img: "",
                            }));
                          }}
                        />
                      </div>
                      <div className="programas-form-group">
                        <label>O URL de la imagen</label>
                        <input
                          type="text"
                          value={nuevoSonido.url_img}
                          onChange={(e) => {
                            setNuevoSonido((prev) => ({
                              ...prev,
                              url_img: e.target.value,
                              imagen: null,
                            }));
                          }}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          disabled={!!imagenFile}
                        />
                      </div>

                      <div className="programas-modal-buttons">
                        <button type="submit" className="btn-submit">
                          Guardar en Programa
                        </button>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setShowAsignarModal(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}

                  {/* LISTA USUARIOS */}
            {activeTab === "usuarios" && canAdmin && (
            <ul className="programas-usuarios-list">
              {usuarios
                .filter((u) => u.tipo !== "admin")
                .map((u) => {
                  
                  // 👉 Lista REAL de asignados
                  const yaAsignado = usuariosAsignados.some(
                    (as) => as.id_usuario === u.id_usuario
                  );

                  return (
                    <li key={u.id_usuario} className="programas-usuario-item">
                      <div className="usuario-info">
                        <h3 className="usuario-name">{u.n_usuario}</h3>
                        <p className="usuario-rol">{u.tipo}</p>
                      </div>

                      {/* BOTONES DINÁMICOS */}
                      {yaAsignado ? (
                        <button
                          className="usuario-btn-desasignar"
                          onClick={() => handleDesasignarUsuario(u.id_usuario)}
                        >
                          Quitar
                        </button>
                      ) : (
                        <button
                          className="usuario-btn-asignar"
                          onClick={() => handleAsignarUsuario(u.id_usuario)}
                        >
                          Asignar
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}


                </div>
              </div>
            </div>
          )}

          {/* [NUEVO] MODAL VER LISTA DETALLADA / EDITAR PROGRAMA */}
          {showDetailModal && (canAdmin || isOperador) && selectedPrograma && (
            <div
              className="programas-modal"
              onClick={() => {
                setShowDetailModal(false);
                setDetailTab("sounds"); // Reset tab
                resetSonidoForm(); // Resetear form de sonido por si se quedó a medio editar
              }}
            >
              <div
                className="programas-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Detalle de {selectedPrograma.nombre}</h2>
                <div className="programas-modal-tabs">
                  <button
                    className={detailTab === "sounds" ? "active" : ""}
                    onClick={() => setDetailTab("sounds")}
                  >
                    Lista de Sonidos
                  </button>
                  {canAdmin && (
                    <button
                      className={detailTab === "edit" ? "active" : ""}
                      onClick={() => setDetailTab("edit")}
                    >
                      Editar Programa
                    </button>
                  )}
                </div>

                <div className="programas-modal-tab-content">
                  {/* PESTAÑA: LISTA DE SONIDOS (con botones de editar/eliminar) */}
                  {detailTab === "sounds" && (
                    <>
                      {programaSonidos.length === 0 ? (
                        <p>No hay sonidos asignados a este programa.</p>
                      ) : (
                        <ul className="sonidos-list">
                          {programaSonidos.map((sonido) => (
                            <li
                              key={sonido.id_sonido}
                              className="sonidos-list-item"
                            >
                              <span>{sonido.nombre_sonido}</span>
                              {(canAdmin ||
                                (isOperador &&
                                  sonido.id_usuario === userId)) && (
                                <div className="sonidos-list-actions">
                                  <button
                                    className="btn-edit"
                                    onClick={() => {
                                      setShowDetailModal(false); // Cierra el modal de detalle
                                      handleEditSonido(sonido); // Abre el modal de edición de sonido
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className="btn-delete"
                                    onClick={() =>
                                      handleRemoveSonido(sonido.id_sonido)
                                    }
                                  >
                                    Quitar
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}

                  {/* PESTAÑA: EDITAR PROGRAMA (SOLO ADMIN) */}
                  {detailTab === "edit" && canAdmin && (
                    <form onSubmit={handleEditPrograma}>
                      <div className="programas-form-group">
                        <label>Nombre del Programa *</label>
                        <input
                          type="text"
                          value={editingPrograma.nombre}
                          onChange={(e) =>
                            setEditingPrograma((prev) => ({
                              ...prev,
                              nombre: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="programas-form-group">
                        <label>Descripción</label>
                        <textarea
                          value={editingPrograma.descripcion}
                          onChange={(e) =>
                            setEditingPrograma((prev) => ({
                              ...prev,
                              descripcion: e.target.value,
                            }))
                          }
                        ></textarea>
                      </div>
                      <div className="programas-form-group">
                        <label>Horario</label>
                        <input
                          type="text"
                          value={editingPrograma.horario}
                          onChange={(e) =>
                            setEditingPrograma((prev) => ({
                              ...prev,
                              horario: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="programas-modal-buttons">
                        <button type="submit" className="btn-submit">
                          Guardar Cambios del Programa
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="programas-modal-buttons">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CREACIÓN DE PROGRAMA */}
      {showNewProgramaModal && canAdmin && (
        <div
          className="programas-modal"
          onClick={() => {
            setShowNewProgramaModal(false);
            setNewProgramaData({ nombre: "", descripcion: "", horario: "" });
          }}
        >
          <div
            className="programas-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>➕ Crear Nuevo Programa</h2>
            <form onSubmit={handleCreatePrograma}>
              <div className="programas-form-group">
                <label>Título del Programa *</label>
                <input
                  type="text"
                  value={newProgramaData.nombre}
                  onChange={(e) =>
                    setNewProgramaData((prev) => ({
                      ...prev,
                      nombre: e.target.value,
                    }))
                  }
                  required
                  autoFocus
                />
              </div>

              <div className="programas-form-group">
                <label>Descripción</label>
                <textarea
                  value={newProgramaData.descripcion}
                  onChange={(e) =>
                    setNewProgramaData((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                ></textarea>
              </div>

              <div className="programas-form-group">
                <label>Horario (Ej: Lunes a Viernes 10:00 - 12:00)</label>
                <input
                  type="text"
                  value={newProgramaData.horario}
                  onChange={(e) =>
                    setNewProgramaData((prev) => ({
                      ...prev,
                      horario: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="programas-modal-buttons">
                <button type="submit" className="btn-submit">
                  Crear Programa
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowNewProgramaModal(false)}
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