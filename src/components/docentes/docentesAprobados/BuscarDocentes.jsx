import { useState, useEffect } from "react";
import "../../../styles/docenteSearch.css";
import { ResultadosDocentes } from "../ResultadosDocentes";
import { Pagination } from "../Paginacion"; // Importa el componente Pagination

export const BuscarDocente = () => {
  const [approvedDocentes, setApprovedDocentes] = useState([]); // Todos los docentes aprobados
  const [loading, setLoading] = useState(true); // Para manejar el estado de carga
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(8); // Número de elementos por página

  // Función para obtener datos de la API
  useEffect(() => {
    const fetchApprovedDocentes = async (searchTerm = "") => {
      try {
        const response = await fetch(
          `http://localhost:4321/api/docentes/postulantes?search=${searchTerm}`
        );
        if (!response.ok) throw new Error("Error al obtener los datos");
        const data = await response.json();

        // Filtrar docentes con estado "aprobado"
        const filteredData = data.filter(
          (docente) => docente.estado.toLowerCase() === "aprobado"
        );
        setApprovedDocentes(filteredData);
        setLoading(false);
      } catch (error) {
        console.error("Error al conectar con la API:", error);
        setLoading(false);
      }
    };

    fetchApprovedDocentes();
  }, []);

  // Lógica para obtener los docentes de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = approvedDocentes.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div className="docente-search-container">
      <div className="results-container">
        {currentItems.length > 0 ? (
          currentItems.map((docente) => (
            <ResultadosDocentes
              key={docente.idDocente}
              nombres={docente.nombres}
              correo={docente.correo}
              numeroDocumento={docente.numeroDocumento}
              telefono={docente.telefono}
              idDocente={docente.idDocente}
            />
          ))
        ) : (
          <p className="no-results">No se encontraron docentes aprobados.</p>
        )}
      </div>

      {/* Usar el componente Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={approvedDocentes.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};