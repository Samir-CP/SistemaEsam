import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import "./headerDash.css"; 
import NotificacionesCampana from "../../components/convocatorias/notificaciones/NotificacionesCampana";

interface DecodedToken {
  idDocente: string;
  nombre: string;
  apellidoPaterno: string;
  idRol: string;
}

export const HeaderDash: React.FC = () => {
  const [idDocente, setidDocente] = useState<string | null>(null);
  const [docenteNombre, setDocenteNombre] = useState<string | null>(null);
  const [docenteApellidoPaterno, setDocenteApellidoPaterno] = useState<string | null>(null);
  const [idRol, setidRol] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const idRol = localStorage.getItem("idRol");
    if (!token || Number(idRol) === 2 || Number(idRol) === 3) {
      window.location.href = "/login";
      return;
    }

    try {
      // Decodificar el token para obtener los datos del usuario
      const decodedToken = jwt_decode<DecodedToken>(token);
      const { idDocente, nombre, apellidoPaterno, idRol } = decodedToken;

      // Almacenar los datos en el localStorage para otros componentes
      localStorage.setItem("idDocente", idDocente);
      localStorage.setItem("docenteNombre", nombre);
      localStorage.setItem("docenteApellidoPaterno", apellidoPaterno);
      localStorage.setItem("idRol", idRol);

      setidDocente(idDocente);
      setDocenteNombre(nombre);
      setDocenteApellidoPaterno(apellidoPaterno);
      setidRol(idRol);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("idDocente");
    localStorage.removeItem("docenteNombre");
    localStorage.removeItem("docenteApellidoPaterno");
    localStorage.removeItem("idRol");
    window.location.href = "/login";
  };

  return (
    <> 
      <header>
        <a id="logoEsam" href="/dashboardDoc"></a>
        <h1 id="titulo-head">Docente Plataforma</h1>

        <div className="header-right">
          <NotificacionesCampana />
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>
      <div className="barraAmarilla"></div>
    </>
  );
};

export default HeaderDash;