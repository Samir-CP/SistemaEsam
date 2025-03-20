import React, { useState, useEffect } from "react";
import { Pagination } from "../docentes/Paginacion";

interface Convocatoria {
  idConvocatoria: number;
  titulo: string;
  perfil: string;
  link: string;
  requisitos: string;
  fechaInicio: string;
  fechaFinal: string;
  estado: string;
}

const ConvocatoriasDoc = () => {
  const [convocatoriasAbiertas, setConvocatoriasAbiertas] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de elementos por página

  // Función para formatear la fecha a YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString) return ""; // Si no hay fecha, retornar vacío
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  };

  // Obtener las convocatorias de la API
  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        const response = await fetch("http://localhost:4321/api/convocatorias/convocatorias");
        if (!response.ok) throw new Error("Error al obtener los datos");
        const data: Convocatoria[] = await response.json();

        // Filtrar solo las convocatorias abiertas y formatear las fechas
        const convocatoriasFiltradas = data
          .filter((c) => c.estado === "abierta")
          .map((c) => ({
            ...c,
            fechaInicio: formatDate(c.fechaInicio),
          }));

        setConvocatoriasAbiertas(convocatoriasFiltradas);
        setLoading(false);
      } catch (error) {
        console.error("Error al conectar con la API:", error);
        setLoading(false);
      }
    };

    fetchConvocatorias();
  }, []);

  // Calcular los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = convocatoriasAbiertas.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Convocatorias Abiertas</h1>
      <div style={styles.grid}>
        {currentItems.map((convocatoria) => (
          <div key={convocatoria.idConvocatoria} style={styles.card}>
            <h2>{convocatoria.titulo}</h2>
            <p>
              <strong>Fecha de inicio:</strong> {convocatoria.fechaInicio}
            </p>
            <a href={convocatoria.link} style={styles.btn}>
              Abrir
            </a>
          </div>
        ))}
      </div>

      {/* Usar el componente de paginación */}
      <Pagination
        currentPage={currentPage}
        totalItems={convocatoriasAbiertas.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

// Estilos directamente en el componente
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px", // Limitar el ancho del contenedor
    margin: "0 auto", // Centrar el contenedor en la página
    height: "80vh", // Altura del contenedor principal (80% del viewport)
    overflowY: "auto" as "auto", // Habilitar scroll vertical
  },
  grid: {
    display: "flex",
    flexDirection: "column" as "column", // Cambiar a columna para que las tarjetas estén una debajo de la otra
    gap: "20px",
  },
  card: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "white",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
    maxWidth: "800px", // Limitar el ancho de la tarjeta
    width: "100%", // Asegura que la tarjeta ocupe el ancho disponible
    margin: "0 auto", // Centrar la tarjeta horizontalmente
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center" as "center", // Centrar el título
  },
  btn: {
    display: "inline-block",
    marginTop: "15px",
    padding: "12px",
    background: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold",
  },
};

export default ConvocatoriasDoc;