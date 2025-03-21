import { useEffect, useState } from "react";

interface Props {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedArea: string;
  selectedSector: string;
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
  selectedArea,
  selectedSector,
}) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener áreas y sectores desde la API
  const fetchAreasSectores = async () => {
    try {
      const response = await fetch("/api/docentes/areas-sectores");
      if (!response.ok) {
        throw new Error("Error al obtener áreas y sectores");
      }
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

  // Cargar áreas y sectores al montar el componente
  useEffect(() => {
    fetchAreasSectores();
  }, []);

  if (loading) {
    return <p>Cargando áreas y sectores...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="area-interes">
      <select
        className="area-select"
        required
        name="idAreaInteres"
        id="idAreaInteres"
        value={selectedArea}
        onChange={onChange}
      >
        <option value="">Área</option>
        {areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.categoria}
          </option>
        ))}
      </select>
      <span className="error-text"></span>
      <i className="error-icon"></i>

      <select
        className="area-select"
        required
        name="idSector"
        id="idSector"
        value={selectedSector}
        onChange={onChange}
      >
        <option value="">Sector</option>
        {sectores.map((sector) => (
          <option key={sector.id} value={sector.id}>
            {sector.sector}
          </option>
        ))}
      </select>
      <span className="error-text"></span>
      <i className="error-icon"></i>
    </div>
  );
};