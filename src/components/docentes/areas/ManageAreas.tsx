import { useState, useEffect } from "react";
import { AreaForm } from "../../ui/AreaForm";
import "./manageArea.css";

interface Area {
  idArea: number;
  nombreArea: string;
}

interface Sector {
  idSector: number;
  nombreSector: string;
}

interface ApiArea {
  id: number;
  categoria: string;
}

interface ApiSector {
  id: number;
  sector: string;
}

export const ManageAreas = () => {
  const [currentAreas, setCurrentAreas] = useState<Area[]>([]);
  const [currentSectors, setCurrentSectors] = useState<Sector[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [allAreas, setAllAreas] = useState<ApiArea[]>([]);
  const [allSectors, setAllSectors] = useState<ApiSector[]>([]);

  const fetchCurrentAreasSectors = async () => {
    try {
      const idDocente = localStorage.getItem("idDocente");
      if (!idDocente) throw new Error("No se encontró ID de docente");
      
      const response = await fetch(`/api/docentes/areas-sectores/areas-actuales?idDocente=${idDocente}`);
      if (!response.ok) throw new Error("Error al obtener áreas");
      
      const data = await response.json();
      
      const areas: Area[] = Array.isArray(data.areas) ? 
        data.areas.map((a: any) => ({ 
          idArea: a.idArea, 
          nombreArea: a.nombreArea
        })) : [];
      
      const sectores: Sector[] = Array.isArray(data.sectores) ? 
        data.sectores.map((s: any) => ({ 
          idSector: s.idSector, 
          nombreSector: s.nombreSector
        })) : [];
      
      setCurrentAreas(areas);
      setCurrentSectors(sectores);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAreasSectors = async () => {
    try {
      const response = await fetch("/api/docentes/areas-sectores");
      if (!response.ok) throw new Error("Error al obtener todas las áreas y sectores");
      const data = await response.json();
      setAllAreas(data.areas);
      setAllSectors(data.sectores);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar todas las áreas y sectores");
    }
  };

  useEffect(() => {
    fetchCurrentAreasSectors();
    fetchAllAreasSectors();
  }, []);

  // Inicializar selecciones cuando se abre el modal
  useEffect(() => {
    if (showAddModal) {
      // Resetear selecciones al abrir el modal
      setSelectedAreas([]);
      setSelectedSectors([]);
    }
  }, [showAddModal]);

  const handleRemoveArea = async (idArea: number) => {
    try {
      const idDocente = localStorage.getItem("idDocente");
      if (!idDocente) throw new Error("No se encontró ID de docente");
      
      const response = await fetch("/api/docentes/areas-sectores/gestionAreas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDocente: Number(idDocente),
          areasAEliminar: [idArea]
        })
      });

      if (!response.ok) throw new Error("Error al eliminar área");
      
      const result = await response.json();
      if (result.success) {
        setCurrentAreas(currentAreas.filter(a => a.idArea !== idArea));
        setSuccessMessage("Área eliminada correctamente");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveSector = async (idSector: number) => {
    try {
      const idDocente = localStorage.getItem("idDocente");
      if (!idDocente) throw new Error("No se encontró ID de docente");
      
      const response = await fetch("/api/docentes/areas-sectores/gestionAreas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDocente: Number(idDocente),
          sectoresAEliminar: [idSector]
        })
      });

      if (!response.ok) throw new Error("Error al eliminar sector");
      
      const result = await response.json();
      if (result.success) {
        setCurrentSectors(currentSectors.filter(s => s.idSector !== idSector));
        setSuccessMessage("Sector eliminado correctamente");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddItems = async () => {
    try {
      const idDocente = localStorage.getItem("idDocente");
      if (!idDocente) throw new Error("No se encontró ID de docente");

      const response = await fetch("/api/docentes/areas-sectores/gestionAreas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDocente: Number(idDocente),
          areasAAñadir: selectedAreas,
          sectoresAAñadir: selectedSectors
        })
      });

      if (!response.ok) throw new Error("Error al actualizar áreas/sectores");
      
      const result = await response.json();
      if (result.success) {
        await fetchCurrentAreasSectors();
        setShowAddModal(false);
        setSuccessMessage("Áreas y sectores actualizados correctamente");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filtrar áreas y sectores que el docente NO tiene actualmente
  const getAvailableAreas = () => {
    const currentAreaIds = currentAreas.map(a => a.idArea);
    return allAreas.filter(area => !currentAreaIds.includes(area.id));
  };

  const getAvailableSectors = () => {
    const currentSectorIds = currentSectors.map(s => s.idSector);
    return allSectors.filter(sector => !currentSectorIds.includes(sector.id));
  };

  if (loading) return <div className="loading">Cargando áreas...</div>;

  return (
    <div className="manage-areas-container">
      <h2>Mis Áreas y Sectores de Interés</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="current-items">
        <h3>Áreas seleccionadas:</h3>
        {currentAreas.length > 0 ? (
          <div className="tags-container">
            {currentAreas.map(area => (
              <div key={area.idArea} className="item-tag">
                <span>{area.nombreArea}</span>
                <button 
                  onClick={() => handleRemoveArea(area.idArea)}
                  className="remove-tag"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes áreas registradas aún.</p>
        )}

        <h3>Sectores seleccionados:</h3>
        {currentSectors.length > 0 ? (
          <div className="tags-container">
            {currentSectors.map(sector => (
              <div key={sector.idSector} className="item-tag">
                <span>{sector.nombreSector}</span>
                <button 
                  onClick={() => handleRemoveSector(sector.idSector)}
                  className="remove-tag"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes sectores registrados aún.</p>
        )}
      </div>
      
      <button 
        onClick={() => setShowAddModal(true)}
        className="add-button"
      >
        Añadir más áreas/sectores
      </button>
      
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Seleccionar nuevas áreas y sectores</h3>
           
            <div className="area-selection-group">
              <h3 className="area-selection-title">Áreas disponibles</h3>
              <div className="area-checkbox-grid">
                {getAvailableAreas().map(area => (
                  <label key={area.id} className="area-checkbox-label">
                    <input
                      type="checkbox"
                      className="area-checkbox-input"
                      checked={selectedAreas.includes(area.id)}
                      onChange={() => 
                        setSelectedAreas(prev =>
                          prev.includes(area.id)
                            ? prev.filter(id => id !== area.id)
                            : [...prev, area.id]
                        )
                      }
                    />
                    <span className="area-checkbox-text">{area.categoria}</span>
                  </label>
                ))}
                {getAvailableAreas().length === 0 && <p>No hay áreas disponibles para agregar</p>}
              </div>
              <div className="selection-count">Áreas seleccionadas: {selectedAreas.length}</div>
            </div>
            
            <div className="area-selection-group">
              <h3 className="area-selection-title">Sectores disponibles</h3>
              <div className="area-checkbox-grid">
                {getAvailableSectors().map(sector => (
                  <label key={sector.id} className="area-checkbox-label">
                    <input
                      type="checkbox"
                      className="area-checkbox-input"
                      checked={selectedSectors.includes(sector.id)}
                      onChange={() => 
                        setSelectedSectors(prev =>
                          prev.includes(sector.id)
                            ? prev.filter(id => id !== sector.id)
                            : [...prev, sector.id]
                        )
                      }
                    />
                    <span className="area-checkbox-text">{sector.sector}</span>
                  </label>
                ))}
                {getAvailableSectors().length === 0 && <p>No hay sectores disponibles para agregar</p>}
              </div>
              <div className="selection-count">Sectores seleccionados: {selectedSectors.length}</div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowAddModal(false)}
                className="cancel-button"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddItems}
                className="confirm-button"
                disabled={selectedAreas.length === 0 && selectedSectors.length === 0}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};