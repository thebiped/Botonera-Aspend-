"use client"

import { useState, useEffect } from "react"

function Programas({ user, apiUrl }) {
  const [programas, setProgramas] = useState([])
  const [sonidos, setSonidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSonidosModal, setShowSonidosModal] = useState(false)
  const [selectedPrograma, setSelectedPrograma] = useState(null)
  const [programaSonidos, setProgramaSonidos] = useState([])
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    horario: "",
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchProgramas()
    fetchSonidos()
  }, [])

  const fetchProgramas = async () => {
    try {
      const res = await fetch(`${apiUrl}/programas`)
      const data = await res.json()

      if (res.ok) {
        setProgramas(data)
      }
    } catch (err) {
      console.error("Error al obtener programas:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSonidos = async () => {
    try {
      const res = await fetch(`${apiUrl}/sonidos`)
      const data = await res.json()

      if (res.ok) {
        setSonidos(data)
      }
    } catch (err) {
      console.error("Error al obtener sonidos:", err)
    }
  }

  const fetchProgramaSonidos = async (programaId) => {
    try {
      const res = await fetch(`${apiUrl}/programas/${programaId}/sonidos`)
      const data = await res.json()

      if (res.ok) {
        setProgramaSonidos(data)
      }
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const method = editingId ? "PUT" : "POST"
      const endpoint = editingId ? `/programas/${editingId}` : "/programas"

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        fetchProgramas()
        setShowModal(false)
        setFormData({ nombre: "", descripcion: "", horario: "" })
        setEditingId(null)
      } else {
        alert(data.error || "Error al guardar el programa")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este programa?")) return

    try {
      const res = await fetch(`${apiUrl}/programas/${id}`, { method: "DELETE" })

      if (res.ok) {
        fetchProgramas()
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar el programa")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const handleEdit = (programa) => {
    setFormData({
      nombre: programa.nombre,
      descripcion: programa.descripcion || "",
      horario: programa.horario || "",
    })
    setEditingId(programa.id_programa)
    setShowModal(true)
  }

  const handleViewSonidos = (programa) => {
    setSelectedPrograma(programa)
    fetchProgramaSonidos(programa.id_programa)
    setShowSonidosModal(true)
  }

  const handleAddSonido = async (sonidoId) => {
    try {
      const res = await fetch(`${apiUrl}/programas/${selectedPrograma.id_programa}/sonidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_sonido: sonidoId }),
      })

      if (res.ok) {
        fetchProgramaSonidos(selectedPrograma.id_programa)
      } else {
        const data = await res.json()
        alert(data.error || "Error al agregar el sonido")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const handleRemoveSonido = async (sonidoId) => {
    try {
      const res = await fetch(`${apiUrl}/programas/${selectedPrograma.id_programa}/sonidos/${sonidoId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        fetchProgramaSonidos(selectedPrograma.id_programa)
      } else {
        const data = await res.json()
        alert(data.error || "Error al quitar el sonido")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const canEdit = user.tipo === "admin" || user.tipo === "operador"

  if (loading) return <div className="loading">Cargando programas...</div>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Programas</h2>
        {canEdit && (
          <button
            className="btn btn-primary btn-small"
            onClick={() => {
              setShowModal(true)
              setEditingId(null)
              setFormData({ nombre: "", descripcion: "", horario: "" })
            }}
          >
            + Nuevo Programa
          </button>
        )}
      </div>

      {programas.length === 0 ? (
        <div className="empty-state">
          <h3>No hay programas disponibles</h3>
          <p>Agrega tu primer programa para comenzar</p>
        </div>
      ) : (
        <div className="grid">
          {programas.map((programa) => (
            <div key={programa.id_programa} className="card">
              <h3>{programa.nombre}</h3>
              <p>{programa.descripcion}</p>
              <p>
                <strong>Horario:</strong> {programa.horario || "No especificado"}
              </p>
              <div className="card-actions">
                <button className="btn btn-primary btn-small" onClick={() => handleViewSonidos(programa)}>
                  Ver Sonidos
                </button>
                {canEdit && (
                  <>
                    <button className="btn btn-primary btn-small" onClick={() => handleEdit(programa)}>
                      Editar
                    </button>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(programa.id_programa)}>
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Editar Programa" : "Nuevo Programa"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Programa *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Horario</label>
                <input
                  type="text"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  placeholder="Ej: Lunes a Viernes 10:00 - 12:00"
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

      {showSonidosModal && selectedPrograma && (
        <div className="modal" onClick={() => setShowSonidosModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sonidos de: {selectedPrograma.nombre}</h2>

            <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Sonidos Asignados:</h3>
            {programaSonidos.length === 0 ? (
              <p style={{ color: "#999", marginBottom: "20px" }}>No hay sonidos asignados</p>
            ) : (
              <ul className="list" style={{ marginBottom: "20px" }}>
                {programaSonidos.map((sonido) => (
                  <li key={sonido.id_sonido} className="list-item">
                    <div>
                      <strong>{sonido.nombre_sonido}</strong>
                      {sonido.url_sonidos && (
                        <audio controls style={{ display: "block", marginTop: "8px", width: "100%" }}>
                          <source src={sonido.url_sonidos} />
                        </audio>
                      )}
                    </div>
                    {canEdit && (
                      <button className="btn btn-danger btn-small" onClick={() => handleRemoveSonido(sonido.id_sonido)}>
                        Quitar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {canEdit && (
              <>
                <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Agregar Sonidos:</h3>
                <ul className="list">
                  {sonidos
                    .filter((s) => !programaSonidos.find((ps) => ps.id_sonido === s.id_sonido))
                    .map((sonido) => (
                      <li key={sonido.id_sonido} className="list-item">
                        <span>{sonido.nombre_sonido}</span>
                        <button className="btn btn-success btn-small" onClick={() => handleAddSonido(sonido.id_sonido)}>
                          Agregar
                        </button>
                      </li>
                    ))}
                </ul>
              </>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSonidosModal(false)}
              style={{ marginTop: "20px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Programas
