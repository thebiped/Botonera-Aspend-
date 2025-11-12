"use client"

import { useState } from "react"
import { User, Lock, Mail } from "lucide-react"
import "../assets/login.css"
import "../assets/register.css"
import bg_login from '../assets/img/jake.png';
import bg_register from '../assets/img/bg_register.jpg';

function Auth({ onLogin, apiUrl }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    n_usuario: "",
    contraseña: "",
    gmail: "",
    tipo: "productor",
    confirmPassword: "",
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
      // Validación para registro
      if (!isLogin) {
        if (formData.contraseña !== formData.confirmPassword) {
          setError("Las contraseñas no coinciden")
          setLoading(false)
          return
        }
        if (!formData.n_usuario || !formData.contraseña || !formData.gmail) {
          setError("Completa todos los campos")
          setLoading(false)
          return
        }
      }

      const endpoint = isLogin ? "/auth/login" : "/auth/register"
      const body = isLogin 
        ? { n_usuario: formData.n_usuario, contraseña: formData.contraseña } 
        : { n_usuario: formData.n_usuario, contraseña: formData.contraseña, gmail: formData.gmail, tipo: formData.tipo }

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
        setFormData({ n_usuario: "", contraseña: "", gmail: "", tipo: "productor", confirmPassword: "" })
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
    <div className={isLogin ? "main" : "main"}>
      <div className={isLogin ? "container-login" : "container-register"}>
        
        {/* Imagen lateral para registro (izquierda) */}
        {!isLogin && (
          <div className="img-register">
            <img src={bg_register} alt="register ilustración" />
          </div>
        )}

        {/* Contenedor del formulario */}
        <div className={isLogin ? "login" : "register"}>
          <div className={isLogin ? "login-form" : "register-form"}>
            <div className="logo">Aspend 102.6</div>
            <div className="title">{isLogin ? "Iniciar Sesión" : "Crear una cuenta"}</div>

            {error && <div style={{ color: '#ff6b6b', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#51cf66', marginBottom: '10px', fontSize: '0.9rem' }}>{success}</div>}

            <form className="form-register" onSubmit={handleSubmit}>
              {/* Username */}
              <div className={isLogin ? "input-group-login" : "input-group-register"}>
                <label>Username</label>
                <div className={isLogin ? "input-group-wrapper-login" : "input-group-wrapper-register"}>
                  <User size={20} color="#27489E" fill="#fff" />
                  <input
                    type="text"
                    placeholder={isLogin ? "Escribe tu usuario..." : "Escribe tu usuario..."}
                    name="n_usuario"
                    value={formData.n_usuario}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email (solo en registro) */}
              {!isLogin && (
                <div className="input-group-register">
                  <label>Email</label>
                  <div className="input-group-wrapper-register">
                    <Mail size={20} color="#27489E" />
                    <input
                      type="email"
                      placeholder="Escribe tu email..."
                      name="gmail"
                      value={formData.gmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className={isLogin ? "input-group-login" : "input-group-register"}>
                <label>Password</label>
                <div className={isLogin ? "input-group-wrapper-login" : "input-group-wrapper-register"}>
                  <Lock size={20} color="#27489E" fill="#fff" />
                  <input
                    type="password"
                    placeholder={isLogin ? "Escribe tu contraseña..." : "Escribe tu contraseña..."}
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password (solo en registro) */}
              {!isLogin && (
                <div className="input-group-register">
                  <label>Confirm Password</label>
                  <div className="input-group-wrapper-register">
                    <Lock size={20} color="#27489E" fill="#fff" />
                    <input
                      type="password"
                      placeholder="Confirma tu contraseña..."
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Checkbox de términos (solo en registro) */}
              {!isLogin && (
                <div className="form-options-register">
                  <div className="checkbox-wrapper">
                    <input type="checkbox" id="terms-register" className="inp-cbx" />
                    <label htmlFor="terms-register" className="cbx">
                      <span>
                        <svg viewBox="0 0 12 10" height="10px" width="12px">
                          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                        </svg>
                      </span>
                      <span>Acepto los términos y condiciones</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Botón de envío */}
              <div className={isLogin ? "action-login" : "action-register"}>
                <button
                  className={isLogin ? "login-btn" : "register-btn"}
                  type="submit"
                  disabled={loading}
                  style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                >
                  {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
                </button>
              </div>
            </form>

            {/* Toggle entre login y registro */}
            <div className={isLogin ? "form-detail-login" : "form-detail-register"}>
              {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
              <span
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                  setSuccess("")
                  setFormData({ n_usuario: "", contraseña: "", gmail: "", tipo: "productor", confirmPassword: "" })
                }}
                style={{
                  color: "#AE1FD2",
                  cursor: "pointer",
                  textDecoration: "underline",
                  marginLeft: "0.4rem",
                }}
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </span>
            </div>
          </div>
        </div>

        {/* Imagen lateral para login (derecha) */}
        {isLogin && (
          <div className="img-login">
            <img src={bg_login} alt="Login ilustración" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth