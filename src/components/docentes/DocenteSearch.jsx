import { useState, useEffect } from "react";
import { DocenteFilter } from "../filters/DocenteFilter";
import { DocenteFilterByGrade } from "../filters/DocenteFilterByGrade";
import { ResultadosDocentes } from "./ResultadosDocentes";
import { Pagination } from "./Paginacion"; // Importa el componente Pagination
import "../../styles/docenteSearch.css";

export const DocenteSearch = () => {
  const [allDocentes, setAllDocentes] = useState([]);
  const [filteredDocentes, setFilteredDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Función para obtener datos de la API
  useEffect(() => {
    const fetchDocentes = async (searchTerm = "") => {
      try {
        const response = await fetch(
          `http://localhost:4321/api/docentes/postulantes?search=${searchTerm}`
        );
        if (!response.ok) throw new Error("Error al obtener los datos");
        const data = await response.json();

        setAllDocentes(data);
        setFilteredDocentes(data.filter((docente) => docente.estado === "postulante"));
        setLoading(false);
      } catch (error) {
        console.error("Error al conectar con la API:", error);
        setLoading(false);
      }
    };

    fetchDocentes();
  }, []);

  // Lógica para manejar la búsqueda
  const handleSearch = (searchTerm) => {
    let filtered = allDocentes;

    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (docente) =>
          (docente.nombres && docente.nombres.toLowerCase().includes(searchLower)) ||
          (docente.correo && docente.correo.toLowerCase().includes(searchLower)) ||
          (docente.numeroDocumento && docente.numeroDocumento.toString().includes(searchTerm)) ||
          (docente.estudiosuperiores &&
            docente.estudiosuperiores.some(
              (estudio) =>
                estudio.tipo === "postgrado" &&
                estudio.nombre &&
                estudio.nombre.toLowerCase().includes(searchLower)
            )) ||
          (docente.cursos &&
            docente.cursos.some((curso) =>
              curso.nombre &&
              curso.nombre.toLowerCase().includes(searchLower)
            ))
      );
    } else {
      filtered = allDocentes.filter((docente) => docente.estado === "postulante");
    }

    setFilteredDocentes(filtered);
    setCurrentPage(1); // Resetear a la primera página después de una búsqueda
  };

  // Lógica para manejar cambios en el filtro de grado académico
  const handleGradeChange = (selectedGrado) => {
    const filtered = selectedGrado
      ? allDocentes.filter((docente) =>
          docente.estudiosuperiores.some(
            (estudio) => estudio.gradoTipo === selectedGrado
          )
        )
      : allDocentes;
    setFilteredDocentes(filtered);
    setCurrentPage(1); // Resetear a la primera página después de un filtrado
  };

  // Lógica para manejar cambios en el filtro de estado
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    let filtered = allDocentes;
    if (status === "agendado") {
      filtered = allDocentes.filter((docente) => docente.agendado === 1 && docente.estado === "postulante");
    } else if (status === "aprobado" || status === "rechazado") {
      filtered = allDocentes.filter(
        (docente) => docente.estado.toLowerCase() === status.toLowerCase()
      );
    } else {
      filtered = allDocentes.filter((docente) => docente.estado === "postulante");
    }
    setFilteredDocentes(filtered);
    setCurrentPage(1); // Resetear a la primera página después de un filtrado
  };

  // Lógica para obtener los docentes de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocentes.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div className="docente-search-container">
      <div className="filters-container">
        <DocenteFilter onSearch={handleSearch} />
        <DocenteFilterByGrade onGradeChange={handleGradeChange} />
        
        <label htmlFor="estado-select">Buscar por estado</label>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="postulante">Todos</option>
          <option value="agendado">Agendados</option>
          <option value="aprobado">Aprobados</option>
          <option value="rechazado">Rechazados</option>
        </select>
      </div>

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
          <p className="no-results">No se encontraron resultados.</p>
        )}
      </div>

      {/* Usar el componente Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredDocentes.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};