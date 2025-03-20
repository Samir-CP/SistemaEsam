import { useState, useEffect } from "react";

interface Types {
  idTipoEstudio: number;
  tipo: string;
}

interface TypesSelectProps {
  selectedTypes: { id: number; name: string };
  onTypesChange: (selectedTypes: { id: number; name: string }) => void;
  valueAndId: string;
}

function TypesSelect({
  selectedTypes,
  onTypesChange,
  valueAndId,
}: TypesSelectProps) {
  const [tipos, setTipos] = useState<Types[]>([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/tipoe/tipoe");
        if (response.ok) {
          const data: Types[] = await response.json();

          // Ordenar y separar por categorías: pregrado (id 1) y posgrado (id 2)
          const pregrado = data.filter((tipo) => tipo.idTipoEstudio === 1); // Ajusta los IDs según tu lógica
          const posgrado = data.filter((tipo) => tipo.idTipoEstudio === 2);

          setTipos([...pregrado, ...posgrado]); // Mantén el orden
        } else {
          console.error("Error al obtener los Tipos de estudios");
        }
      } catch (error) {
        console.error("Error al consumir la API:", error);
      }
    };

    fetchTypes();
  }, []);

  return (
    <label>
      Tipo de estudio:
      <select
        name={valueAndId}
        id={valueAndId}
        value={selectedTypes.id || ""}
        onChange={(e) => {
          const selectedId = parseInt(e.target.value, 10);
          const selectedType = tipos.find((tipo) => tipo.idTipoEstudio === selectedId);
          if (selectedType) {
            onTypesChange({ id: selectedType.idTipoEstudio, name: selectedType.tipo });
          }
        }}
      >
        <option value="" disabled>
          Selecciona un tipo de estudio
        </option>
        {tipos.map((tipo) => (
          <option key={tipo.idTipoEstudio} value={tipo.idTipoEstudio}>
            {tipo.tipo}
          </option>
        ))}
      </select>
    </label>
  );
}

export default TypesSelect;
