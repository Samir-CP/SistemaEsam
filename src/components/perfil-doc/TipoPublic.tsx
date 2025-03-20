import { useState, useEffect } from "react";

// Tipos para las props y los datos del país
interface TipoPubicacion {
  idTipoPublicacion: number;
  tipo: string;
  valueAndId: string;
  selected: string;
  selectedId: number;
}

interface TipopSelectProps {
  selectedTipop: { id: number; name: string };
  onTipoChange: (selectedTipop: { id: number; name: string }) => void;
  valueAndId: string;
  selected: string;
  selectedId: number;
}

export function TipoPublic({ selectedTipop, onTipoChange, valueAndId,
    selected,selectedId }: TipopSelectProps) {
  const [tipoP, setTipop] = useState<TipoPubicacion[]>([]); // Lista de países

  // Obtener los países desde la API al montar el componente
  useEffect(() => {
    const fetchTipop = async () => {
      try {
        const response = await fetch("/api/prodintelectual/tipopublic"); 
        if (response.ok) {
          const data: TipoPubicacion[] = await response.json();
          setTipop(data); // Actualiza la lista de países
        } else {
          console.error("Error al obtener los tipos de publicacion");
        }
      } catch (error) {
        console.error("Error al consumir la API:", error);
      }
    };

    fetchTipop();
  }, []);

  return(
    <label>
    Tipo de Publicacion:
    <select
    name={valueAndId}
    id={valueAndId}
      value={selectedTipop?.id || ""}
      onChange={(e) => {
        const selectedId = parseInt(e.target.value, 10);
        const tipop = tipoP.find((tp) => tp.idTipoPublicacion === selectedId);
        if (tipop) {
            onTipoChange({ id: tipop.idTipoPublicacion, name: tipop.tipo });
        }
      }}
    >
      <option value={selectedId} selected>{selected}</option>
      {tipoP.map((tp) => (
        <option key={tp.idTipoPublicacion} value={tp.idTipoPublicacion}>
          {tp.tipo}
        </option>
      ))}
    </select>
  </label>
  );
}
