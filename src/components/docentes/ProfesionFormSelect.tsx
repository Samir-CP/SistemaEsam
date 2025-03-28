import { useEffect, useState, useRef } from "react";
import "./profesion.css"; 

interface ProfesionFormSelectProps {
  valueAndId?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
}

export const ProfesionFormSelect = ({
  valueAndId,
  onChange,
  defaultValue = "",
}: ProfesionFormSelectProps) => {
  const [profesiones, setProfesiones] = useState<any[]>([]);
  const [filteredProfesiones, setFilteredProfesiones] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfesiones = async () => {
      try {
        const response = await fetch("/api/docentes/profesiones/profesiones");
        const data = await response.json();
        setProfesiones(data);
        setFilteredProfesiones(data);
      } catch (error) {
        console.error("Error fetching profesiones:", error);
      }
    };

    fetchProfesiones();

    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length > 0) {
      const filtered = profesiones.filter((profesion) =>
        profesion.nombreProfesion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProfesiones(filtered);
    } else {
      setFilteredProfesiones(profesiones);
    }
    
    onChange(e);
    setShowDropdown(true);
  };

  const handleProfesionSelect = (profesion: any) => {
    setInputValue(profesion.nombreProfesion);
    setShowDropdown(false);
    
    // Simular evento onChange con el valor seleccionado
    const mockEvent = {
      target: {
        name: valueAndId || "profesion",
        value: profesion.idProfesion,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(mockEvent);
  };

  return (
    <div className="profesion-select-container">
      <input
        type="text"
        ref={inputRef}
        className="profesion-input"
        placeholder="Buscar profesión..."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        name={valueAndId || "profesion"}
      />
      
      {showDropdown && filteredProfesiones.length > 0 && (
        <div className="profesion-dropdown" ref={dropdownRef}>
          {filteredProfesiones.map((profesion) => (
            <div
              key={profesion.idProfesion}
              className="profesion-option"
              onClick={() => handleProfesionSelect(profesion)}
            >
              {profesion.nombreProfesion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};