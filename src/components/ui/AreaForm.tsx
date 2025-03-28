import { useEffect, useState } from "react";

interface Props {
  onChange: (selectedAreas: number[], selectedSectors: number[]) => void;
  selectedAreas: number[];
  selectedSectors: number[];
}

interface Area {
  id: number;
  categoria: string;
}

interface Sector {
  id: number;
  sector: string;
}

export const AreaForm: React.FC<Props> = ({
  onChange,
  selectedAreas = [],
  selectedSectors = [],
}) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreasSectores = async () => {
    try {
      const response = await fetch("/api/docentes/areas-sectores");
      if (!response.ok) throw new Error("Error al obtener áreas y sectores");
      const data = await response.json();
      setAreas(data.areas);
      setSectores(data.sectores);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar áreas y sectores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreasSectores();
  }, []);

  const toggleArea = (areaId: number) => {
    const newAreas = selectedAreas.includes(areaId)
      ? selectedAreas.filter(id => id !== areaId)
      : [...selectedAreas, areaId];
    onChange(newAreas, selectedSectors);
  };

  const toggleSector = (sectorId: number) => {
    const newSectors = selectedSectors.includes(sectorId)
      ? selectedSectors.filter(id => id !== sectorId)
      : [...selectedSectors, sectorId];
    onChange(selectedAreas, newSectors);
  };

  if (loading) return <div className="area-loading">Cargando áreas y sectores...</div>;
  if (error) return <div className="area-error">{error}</div>;

  return (
    <div className="area-form-container">
      <div className="area-selection-group">
        <h3 className="area-selection-title">Áreas de Interés</h3>
        <div className="area-checkbox-grid">
          {areas.map(area => (
            <label key={area.id} className="area-checkbox-label">
              <input
                type="checkbox"
                className="area-checkbox-input"
                checked={selectedAreas.includes(area.id)}
                onChange={() => toggleArea(area.id)}
              />
              <span className="area-checkbox-text">{area.categoria}</span>
            </label>
          ))}
        </div>
        <div className="selection-count">Áreas seleccionadas: {selectedAreas.length}</div>
      </div>
  
      <div className="area-selection-group">
        <h3 className="area-selection-title">Sectores de Interés</h3>
        <div className="area-checkbox-grid">
          {sectores.map(sector => (
            <label key={sector.id} className="area-checkbox-label">
              <input
                type="checkbox"
                className="area-checkbox-input"
                checked={selectedSectors.includes(sector.id)}
                onChange={() => toggleSector(sector.id)}
              />
              <span className="area-checkbox-text">{sector.sector}</span>
            </label>
          ))}
        </div>
        <div className="selection-count">Sectores seleccionados: {selectedSectors.length}</div>
      </div>
    </div>
  );
};