import React from "react";
import "../../styles/docenteSearch.css"; // Asegúrate de importar el CSS

export const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Función para manejar el cambio de página
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  return (
    <div className="pagination">
      {/* Botón "Anterior" */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        &#8592; {/* Flecha hacia la izquierda */}
      </button>

      {/* Botones de números de página */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => handlePageChange(i + 1)}
          className={`pagination-button ${currentPage === i + 1 ? "active" : ""}`}
        >
          {i + 1}
        </button>
      ))}

      {/* Botón "Siguiente" */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        &#8594; {/* Flecha hacia la derecha */}
      </button>
    </div>
  );
};