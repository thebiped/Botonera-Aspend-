"use client";

import { useState, useEffect } from "react";
import "../assets/usuarios.css";

function Usuarios({ user, apiUrl }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // 👉 Nuevo: modal para agregar usuario
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUser, setNewUser] = useState({
    n_usuario: "",
    gmail: "",
    contraseña: "",
    tipo: "productor",
  });

  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

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

  // -----------------------------------------------------
  // 🟦 MODAL AGREGAR USUARIO
  // -----------------------------------------------------

  const openAddModal = () => {
    setAddError("");
    setAddSuccess("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewUser({
      n_usuario: "",
      gmail: "",
      contraseña: "",
      tipo: "productor",
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (res.ok) {
        setAddSuccess("Usuario creado correctamente");
        fetchUsuarios();

        setTimeout(() => {
          closeAddModal();
        }, 1200);

      } else {
        setAddError(data.error || "Error al crear usuario");
      }
    } catch (err) {
      setAddError("No se pudo conectar al servidor");
    }
  };


  // -----------------------------------------------------

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
      {/* HEADER */}
      <div className="usuarios-header">
        <h2>Gestión de usuarios</h2>

        {/* ➕ Botón para abrir modal */}
        <button className="btn-agregar-usuario" onClick={openAddModal}>
          + Agregar usuario
        </button>
      </div>

      {/* LISTA */}
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

              {/* CAMBIO DE ROL */}
              {editingUser === usuario.id_usuario && (
                <div className="usuario-edit-overlay">
                  <select
                    value={usuario.tipo}
                    onChange={(e) =>
                      handleChangeTipo(
                        usuario.id_usuario,
                        e.target.value
                      )
                    }
                    className="usuario-role-select"
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

      {/* 🟥 MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

      {/* 🟦 MODAL AGREGAR USUARIO */}
      {showAddModal && (
        <div className="modal-overlay-usuario" onClick={closeAddModal}>
          <div
            className="modal-content-usuario"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Agregar usuario</h3>

            {addError && <p className="error-msg">{addError}</p>}
            {addSuccess && <p className="success-msg">{addSuccess}</p>}

            <form onSubmit={handleAddUser} className="add-user-form">
              <label>Username</label>
              <input
                type="text"
                value={newUser.n_usuario}
                onChange={(e) =>
                  setNewUser({ ...newUser, n_usuario: e.target.value })
                }
                required
              />

              <label>Email</label>
              <input
                type="email"
                value={newUser.gmail}
                onChange={(e) =>
                  setNewUser({ ...newUser, gmail: e.target.value })
                }
                required
              />

              <label>Contraseña</label>
              <input
                type="password"
                value={newUser.contraseña}
                onChange={(e) =>
                  setNewUser({ ...newUser, contraseña: e.target.value })
                }
                required
              />

              {/* Si NO querés rol acá, lo saco */}
              <label>Rol</label>
              <select
              className="add-usuario-role-select"
                value={newUser.tipo}
                onChange={(e) =>
                  setNewUser({ ...newUser, tipo: e.target.value })
                }
              >
                <option value="productor">Productor</option>
                <option value="operador">Operador</option>
                <option value="admin">Admin</option>
              </select>

              <div className="add-btn-container">
                <button type="submit" className="btn-confirm">
                  Crear usuario
                </button>

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeAddModal}
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

export default Usuarios;
