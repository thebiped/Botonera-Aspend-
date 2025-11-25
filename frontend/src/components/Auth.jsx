"use client"

import { useState } from "react"
import { User, Lock } from "lucide-react"
import "../assets/login.css"
import bg_login from '../assets/img/jake.png';

function Auth({ onLogin, apiUrl }) {
  const [formData, setFormData] = useState({
    n_usuario: "",
    contraseña: "",
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
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          n_usuario: formData.n_usuario,
          contraseña: formData.contraseña
        }),
      })

      const data = await res.json()

      if (res.ok && data.usuario) {
        setSuccess("Login exitoso")

        const safeUser = {
          id: data.usuario.id_usuario,
          name: data.usuario.n_usuario,
          role: data.usuario.tipo?.toLowerCase(),
          tipo: data.usuario.tipo,
          n_usuario: data.usuario.n_usuario,
          gmail: data.usuario.gmail,
        }

        onLogin(safeUser)
      } else {
        setError(data.error || "Credenciales incorrectas")
      }
    } catch (err) {
      setError("No se pudo conectar al servidor. Verifica que el backend esté en el puerto 3001.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main">
      <div className="container-login">

        <div className="login">
          <div className="login-form">
            <div className="logo">Aspend 102.6</div>
            <div className="title">Iniciar Sesión</div>

            {error && <div style={{ color: '#ff6b6b', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: '#51cf66', marginBottom: '10px' }}>{success}</div>}

            <form className="form-register" onSubmit={handleSubmit}>
              {/* Username */}
              <div className="input-group-login">
                <label>Username</label>
                <div className="input-group-wrapper-login">
                  <User size={20} color="#27489E" />
                  <input
                    type="text"
                    placeholder="Escribe tu usuario..."
                    name="n_usuario"
                    value={formData.n_usuario}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group-login">
                <label>Password</label>
                <div className="input-group-wrapper-login">
                  <Lock size={20} color="#27489E" />
                  <input
                    type="password"
                    placeholder="Escribe tu contraseña..."
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Botón */}
              <div className="action-login">
                <button
                  className="login-btn"
                  type="submit"
                  disabled={loading}
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Imagen lateral */}
        <div className="img-login">
          <img src={bg_login} alt="Login ilustración" />
        </div>
      </div>
    </div>
  )
}

export default Auth
