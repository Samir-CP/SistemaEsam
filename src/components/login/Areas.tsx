import { useState, useEffect } from "react";
import { AreaForm } from "../../components/ui/AreaForm";
import jwt_decode from "jwt-decode"; // Añade esta importación
import "./areas.css";

interface DecodedToken {
  idDocente: number;
  nombre: string;
  apellidoPaterno: string;
  idRol: number;
  idArea?: number | null;
}

export const SeleccionAreas = () => {
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [idDocente, setIdDocente] = useState<number | null>(null);

  useEffect(() => {
    // Verificar token y extraer idDocente
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const decodedToken = jwt_decode<DecodedToken>(token);
      if (!decodedToken.idDocente) {
        throw new Error("Token inválido: falta idDocente");
      }
      setIdDocente(decodedToken.idDocente);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      localStorage.removeItem("token"); // Limpiar token inválido
      window.location.href = "/login";
    }
  }, []);

  const handleAreaSelection = (areas: number[], sectors: number[]) => {
    setSelectedAreas(areas);
    setSelectedSectors(sectors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!idDocente) {
        throw new Error("No se encontró el ID del docente");
      }

      // Validar selección
      if (selectedAreas.length === 0 || selectedSectors.length === 0) {
        setMessage("Debes seleccionar al menos un área y un sector de interés");
        return;
      }

      const response = await fetch("/api/docentes/insertar-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDocente: idDocente,
          idAreasInteres: selectedAreas, 
          idSectores: selectedSectors    
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Guardar el nuevo token y redirigir
        localStorage.setItem("token", result.token);
        window.location.href = "/dashboardDoc";
      } else {
        setMessage(result.error || "Error al guardar las áreas de interés");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="areas-container">
      <div className="areas-box">
        <h1>Selecciona tus áreas de interés</h1>
        <p className="areas-subtitle">
          Por favor, selecciona las áreas y sectores en los que deseas impartir docencia.
          <br />
        </p>

        <form onSubmit={handleSubmit} className="areas-form">
          <div className="form-row">
            <AreaForm
              onChange={handleAreaSelection}
              selectedAreas={selectedAreas}
              selectedSectors={selectedSectors}
            />
          </div>
          <button 
            type="submit" 
            className="areas-button"
            disabled={loading || selectedAreas.length === 0 || selectedSectors.length === 0}
          >
            {loading ? "Guardando..." : "Continuar"}
          </button>

          {message && <p className="areas-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};