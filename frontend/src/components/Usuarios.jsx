"use client"

import { useState, useEffect } from "react"

function Usuarios({ user, apiUrl }) {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${apiUrl}/usuarios`)
      const data = await res.json()

      if (res.ok) {
        setUsuarios(data)
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeTipo = async (userId, nuevoTipo) => {
    try {
      const res = await fetch(`${apiUrl}/usuarios/${userId}/tipo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo: nuevoTipo }),
      })

      const data = await res.json()

      if (res.ok) {
        fetchUsuarios()
        setEditingUser(null)
      } else {
        alert(data.error || "Error al cambiar el tipo de usuario")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return

    try {
      const res = await fetch(`${apiUrl}/usuarios/${userId}`, { method: "DELETE" })

      if (res.ok) {
        fetchUsuarios()
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar el usuario")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("No se pudo conectar al servidor")
    }
  }

  if (loading) return <div className="loading">Cargando usuarios...</div>

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Gestión de Usuarios</h2>

      {usuarios.length === 0 ? (
        <div className="empty-state">
          <h3>No hay usuarios registrados</h3>
        </div>
      ) : (
        <ul className="list">
          {usuarios.map((usuario) => (
            <li key={usuario.id_usuario} className="list-item">
              <div>
                <strong>{usuario.n_usuario}</strong>
                <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>{usuario.gmail}</p>
                {editingUser === usuario.id_usuario ? (
                  <select
                    value={usuario.tipo}
                    onChange={(e) => handleChangeTipo(usuario.id_usuario, e.target.value)}
                    style={{ marginTop: "8px", padding: "4px 8px", borderRadius: "4px", border: "2px solid #667eea" }}
                  >
                    <option value="productor">Productor</option>
                    <option value="operador">Operador</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <div className="user-badge" style={{ display: "inline-block", marginTop: "8px" }}>
                    {usuario.tipo}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                {editingUser === usuario.id_usuario ? (
                  <button className="btn btn-secondary btn-small" onClick={() => setEditingUser(null)}>
                    Cancelar
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => setEditingUser(usuario.id_usuario)}
                    disabled={usuario.id_usuario === user.id_usuario}
                  >
                    Cambiar Rol
                  </button>
                )}
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(usuario.id_usuario)}
                  disabled={usuario.id_usuario === user.id_usuario}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Usuarios
