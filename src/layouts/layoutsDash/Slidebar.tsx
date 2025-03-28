import React, { useState, useEffect } from "react";
import "./slidebar.css";

const Slidebar: React.FC = () => {
  const [docenteNombre, setDocenteNombre] = useState<string | null>(null);
  const [docenteApellidoPaterno, setDocenteApellidoPaterno] = useState<string | null>(null);

  useEffect(() => {
    // Recuperar datos del localStorage
    const nombre = localStorage.getItem("docenteNombre");
    const apellidoPaterno = localStorage.getItem("docenteApellidoPaterno");

    if (nombre && apellidoPaterno) {
      setDocenteNombre(nombre);
      setDocenteApellidoPaterno(apellidoPaterno);
    }
  }, []);

  return (
    <div className="slidebar">
      <div className="welcome-section">
        <h3 className="admin-name">
          Bienvenido,{" "}
          <span id="docenteNombre">
            {docenteNombre && docenteApellidoPaterno
              ? `${docenteNombre} ${docenteApellidoPaterno}`
              : "Cargando..."}
          </span>
        </h3>
      </div>
      <ul className="menu">
        
        <li className="menu-item"> <a href="/dashboardDoc">
      <span>Perfil</span>
    </a></li>
        <li className="menu-item">Configuración</li>
        <li className="menu-item">
    <a href="/dashboardDoc/archivosDocentes/archivos">
      <span>Subir Archivos</span>
    </a>  
  </li>
  <li className="menu-item">
    <a href="/dashboardDoc/convocatorias/convocatoria">
      <span>Convocatorias</span>
    </a>  
  </li>
  <li className="menu-item">
    <a href="/dashboardDoc/areas/areasInteres">
      <span>Areas de Interes</span>
    </a>  
  </li>
        
      </ul>
    </div>
  );
};

export default Slidebar;