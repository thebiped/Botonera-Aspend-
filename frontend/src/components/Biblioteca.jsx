"use client"

import { useState, useEffect } from "react"

function Biblioteca({ user, apiUrl }) {
  const [sonidos, setSonidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nombre_sonido: "",
    url_sonidos: "",
    url_img: "",
  })
  const [audioFile, setAudioFile] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchSonidos()
  }, [])

  const fetchSonidos = async () => {
    try {
      const res = await fetch(`${apiUrl}/sonidos`)
      const data = await res.json()

      if (res.ok) {
        setSonidos(data)
      }
    } catch (err) {
      console.error("Error al obtener sonidos:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const method = editingId ? "PUT" : "POST"
      const endpoint = editingId ? `/sonidos/${editingId}` : "/sonidos"

      const formDataToSend = new FormData()
      formDataToSend.append("nombre_sonido", formData.nombre_sonido)

      if (audioFile) {
        formDataToSend.append("audio", audioFile)
      } else if (formData.url_sonidos) {
        formDataToSend.append("url_sonidos", formData.url_sonidos)
      }

      if (imagenFile) {
        formDataToSend.append("imagen", imagenFile)
      } else if (formData.url_img) {
        formDataToSend.append("url_img", formData.url_img)
      }

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method,
        body: formDataToSend,
      })

      const data = await res.json()

      if (res.ok) {
        fetchSonidos()
        setShowModal(false)
        setFormData({ nombre_sonido: "", url_sonidos: "", url_img: "" })
        setAudioFile(null)
        setImagenFile(null)
        setEditingId(null)
      } else {
        alert(data.error || "Error al guardar el sonido")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este sonido?")) return

    try {
      const res = await fetch(`${apiUrl}/sonidos/${id}`, { method: "DELETE" })

      if (res.ok) {
        fetchSonidos()
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar el sonido")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const handleEdit = (sonido) => {
    setFormData({
      nombre_sonido: sonido.nombre_sonido,
      url_sonidos: sonido.url_sonidos || "",
      url_img: sonido.url_img || "",
    })
    setAudioFile(null)
    setImagenFile(null)
    setEditingId(sonido.id_sonido)
    setShowModal(true)
  }

  const canEdit = user.tipo === "admin" || user.tipo === "operador"

  if (loading) return <div className="loading">Cargando sonidos...</div>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Biblioteca de Sonidos</h2>
        {canEdit && (
          <button
            className="btn btn-primary btn-small"
            onClick={() => {
              setShowModal(true)
              setEditingId(null)
              setFormData({ nombre_sonido: "", url_sonidos: "", url_img: "" })
              setAudioFile(null)
              setImagenFile(null)
            }}
          >
            + Nuevo Sonido
          </button>
        )}
      </div>

      {sonidos.length === 0 ? (
        <div className="empty-state">
          <h3>No hay sonidos disponibles</h3>
          <p>Agrega tu primer sonido para comenzar</p>
        </div>
      ) : (
        <div className="grid">
          {sonidos.map((sonido) => (
            <div key={sonido.id_sonido} className="card">
              {sonido.url_img && (
                <img
                  src={sonido.url_img || "/placeholder.svg"}
                  alt={sonido.nombre_sonido}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />
              )}
              <h3>{sonido.nombre_sonido}</h3>
              {sonido.url_sonidos && (
                <audio controls className="audio-player">
                  <source src={sonido.url_sonidos} />
                </audio>
              )}
              {canEdit && (
                <div className="card-actions">
                  <button className="btn btn-primary btn-small" onClick={() => handleEdit(sonido)}>
                    Editar
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(sonido.id_sonido)}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Editar Sonido" : "Nuevo Sonido"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Sonido *</label>
                <input
                  type="text"
                  value={formData.nombre_sonido}
                  onChange={(e) => setFormData({ ...formData, nombre_sonido: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Audio del Sonido</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    setAudioFile(e.target.files[0])
                    setFormData({ ...formData, url_sonidos: "" })
                  }}
                />
                {audioFile && (
                  <p style={{ color: "#4CAF50", fontSize: "14px", marginTop: "5px" }}>
                    Archivo seleccionado: {audioFile.name}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>O ingresa URL del audio</label>
                <input
                  type="text"
                  value={formData.url_sonidos}
                  onChange={(e) => {
                    setFormData({ ...formData, url_sonidos: e.target.value })
                    setAudioFile(null)
                  }}
                  placeholder="https://ejemplo.com/sonido.mp3"
                  disabled={audioFile !== null}
                />
              </div>

              <div className="form-group">
                <label>Imagen del Sonido</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setImagenFile(e.target.files[0])
                    setFormData({ ...formData, url_img: "" })
                  }}
                />
                {imagenFile && (
                  <p style={{ color: "#4CAF50", fontSize: "14px", marginTop: "5px" }}>
                    Archivo seleccionado: {imagenFile.name}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>O ingresa URL de la imagen</label>
                <input
                  type="text"
                  value={formData.url_img}
                  onChange={(e) => {
                    setFormData({ ...formData, url_img: e.target.value })
                    setImagenFile(null)
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={imagenFile !== null}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingId ? "Actualizar" : "Crear"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Biblioteca
