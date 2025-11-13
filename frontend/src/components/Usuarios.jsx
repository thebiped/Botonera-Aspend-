"use client";

import { useState, useEffect } from "react";
import "../assets/usuarios.css";

function Usuarios({ user, apiUrl }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${apiUrl}/usuarios`);
      const data = await res.json();

      if (res.ok) {
        setUsuarios(data);
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTipo = async (userId, nuevoTipo) => {
    try {
      const res = await fetch(`${apiUrl}/usuarios/${userId}/tipo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo: nuevoTipo }),
      });

      const data = await res.json();

      if (res.ok) {
        fetchUsuarios();
        setEditingUser(null);
      } else {
        alert(data.error || "Error al cambiar el tipo de usuario");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  const openDeleteModal = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`${apiUrl}/usuarios/${userToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsuarios();
        closeDeleteModal();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar el usuario");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo conectar al servidor");
    }
  };

  if (loading)
    return <div className="usuarios-loading">Cargando usuarios...</div>;

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h2>Gestión de usuarios</h2>
      </div>

      {usuarios.length === 0 ? (
        <div className="usuarios-empty">
          <h3>No hay usuarios registrados</h3>
        </div>
      ) : (
        <ul className="usuarios-list">
          {usuarios.map((usuario) => (
            <li key={usuario.id_usuario} className="usuario-item">
              <div className="usuario-avatar">👤</div>
              <div className="usuario-info">
                <h3 className="usuario-name">{usuario.n_usuario}</h3>
                <p className="usuario-email">{usuario.gmail}</p>
                <p className="usuario-rol">Rol: {usuario.tipo}</p>
              </div>
              <div className="usuario-actions">
                {user?.tipo === "admin" && (
                  <>
                    <button
                      className="usuario-action-btn usuario-btn-edit"
                      onClick={() => setEditingUser(usuario.id_usuario)}
                      disabled={usuario.id_usuario === user.id_usuario}
                      title="Editar rol"
                    >
                      ✎
                    </button>
                    <button
                      className="usuario-action-btn usuario-btn-delete"
                      onClick={() => openDeleteModal(usuario.id_usuario)}
                      disabled={usuario.id_usuario === user.id_usuario}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>

              {editingUser === usuario.id_usuario && (
                <div className="usuario-edit-overlay">
                  <select
                    value={usuario.tipo}
                    onChange={(e) =>
                      handleChangeTipo(usuario.id_usuario, e.target.value)
                    }
                    className="usuario-role-select"
                    autoFocus
                  >
                    <option value="productor">Productor</option>
                    <option value="operador">Operador</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    className="usuario-action-btn usuario-btn-cancel"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 🟥 Modal de confirmación al eliminar */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>¿Eliminar usuario?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={handleDelete}>
                Eliminar
              </button>
              <button className="btn-cancel" onClick={closeDeleteModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
