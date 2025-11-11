"use client";

import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

const API_URL = "http://localhost:3000/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error al parsear usuario guardado:", err);
        localStorage.removeItem("user"); // Limpia si está corrupto
      }
    } else {
      localStorage.removeItem("user"); // Si era "undefined", lo borramos
    }

    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="app">
      {!user ? (
        <Auth onLogin={handleLogin} apiUrl={API_URL} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} apiUrl={API_URL} />
      )}
    </div>
  );
}

export default App;
