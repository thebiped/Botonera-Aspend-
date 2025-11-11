"use client"

import { useState, useEffect } from "react"

function SonidosInstitucionales({ user, apiUrl }) {
  const [sonidos, setSonidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    url_sonido: "",
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
      const res = await fetch(`${apiUrl}/sonidos-institucionales`)
      const data = await res.json()

      if (res.ok) {
        setSonidos(data)
      }
    } catch (err) {
      console.error("Error al obtener sonidos institucionales:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const method = editingId ? "PUT" : "POST"
      const endpoint = editingId ? `/sonidos-institucionales/${editingId}` : "/sonidos-institucionales"

      const formDataToSend = new FormData()
      formDataToSend.append("nombre", formData.nombre)

      if (audioFile) {
        formDataToSend.append("audio", audioFile)
      } else if (formData.url_sonido) {
        formDataToSend.append("url_sonido", formData.url_sonido)
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
        setFormData({ nombre: "", url_sonido: "", url_img: "" })
        setAudioFile(null)
        setImagenFile(null)
        setEditingId(null)
      } else {
        alert(data.error || "Error al guardar el sonido institucional")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este sonido institucional?")) return

    try {
      const res = await fetch(`${apiUrl}/sonidos-institucionales/${id}`, { method: "DELETE" })

      if (res.ok) {
        fetchSonidos()
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar el sonido institucional")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const handleEdit = (sonido) => {
    setFormData({
      nombre: sonido.nombre,
      url_sonido: sonido.url_sonido || "",
      url_img: sonido.url_img || "",
    })
    setAudioFile(null)
    setImagenFile(null)
    setEditingId(sonido.id_sonidos_institucionales)
    setShowModal(true)
  }

  if (loading) return <div className="loading">Cargando sonidos institucionales...</div>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Sonidos Institucionales</h2>
        <button
          className="btn btn-primary btn-small"
          onClick={() => {
            setShowModal(true)
            setEditingId(null)
            setFormData({ nombre: "", url_sonido: "", url_img: "" })
            setAudioFile(null)
            setImagenFile(null)
          }}
        >
          + Nuevo Sonido Institucional
        </button>
      </div>

      {sonidos.length === 0 ? (
        <div className="empty-state">
          <h3>No hay sonidos institucionales</h3>
          <p>Agrega el primer sonido institucional</p>
        </div>
      ) : (
        <div className="grid">
          {sonidos.map((sonido) => (
            <div key={sonido.id_sonidos_institucionales} className="card">
              {sonido.url_img && (
                <img
                  src={sonido.url_img || "/placeholder.svg"}
                  alt={sonido.nombre}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />
              )}
              <h3>{sonido.nombre}</h3>
              {sonido.url_sonido && (
                <audio controls className="audio-player">
                  <source src={sonido.url_sonido} />
                </audio>
              )}
              <div className="card-actions">
                <button className="btn btn-primary btn-small" onClick={() => handleEdit(sonido)}>
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(sonido.id_sonidos_institucionales)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Editar Sonido Institucional" : "Nuevo Sonido Institucional"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    setFormData({ ...formData, url_sonido: "" })
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
                  value={formData.url_sonido}
                  onChange={(e) => {
                    setFormData({ ...formData, url_sonido: e.target.value })
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

export default SonidosInstitucionales
