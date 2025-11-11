"use client"

import { useState } from "react"

function Auth({ onLogin, apiUrl }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    n_usuario: "",
    contraseña: "",
    gmail: "",
    tipo: "productor",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register"
      const body = isLogin ? { n_usuario: formData.n_usuario, contraseña: formData.contraseña } : formData

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok && data.usuario) {
        // Login exitoso
        setSuccess("Login exitoso")

        // Guardar usuario en formato correcto
        const safeUser = {
          id: data.usuario.id_usuario,
          name: data.usuario.n_usuario,
          role: data.usuario.tipo?.toLowerCase(),
          tipo: data.usuario.tipo,
          n_usuario: data.usuario.n_usuario,
          gmail: data.usuario.gmail,
        }

        onLogin(safeUser)
      } else if (res.ok && !isLogin) {
        // Registro exitoso
        setSuccess("Usuario registrado correctamente. Ahora puedes iniciar sesión.")
        setIsLogin(true)
        setFormData({ n_usuario: "", contraseña: "", gmail: "", tipo: "productor" })
      } else {
        setError(data.error || data.message || "Error en la operación")
      }
    } catch (err) {
      setError("No se pudo conectar al servidor. Verifica que el backend esté corriendo en el puerto 3001")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Iniciar Sesión" : "Registro"}</h2>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input type="text" name="n_usuario" value={formData.n_usuario} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="gmail" value={formData.gmail} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Tipo de Usuario</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                  <option value="productor">Productor</option>
                  <option value="operador">Operador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>

        <div className="switch-text">
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <span className="switch-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Auth
