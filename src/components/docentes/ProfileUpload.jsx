import React, { useState, useEffect } from "react";
import { Modal } from "../util/modale";
import { UploadFile } from "./UploadFile";
import { Pencil, Trash2 } from "lucide-react"; // Importar íconos de lucide-react

export const ProfileUpload = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [archivosDocente, setArchivosDocente] = useState([]);
  const [idDocente, setIdDocente] = useState(null);
  const [archivoParaEditar, setArchivoParaEditar] = useState(null);

  // Categorías predefinidas
  const categoriasPredefinidas = [
    "carnet",
    "certificados",
    "diplomados",
    "doctorados",
    "maestrías",
    "tituloProvisionN",
  ];

  // Obtener el ID del docente desde el localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("idDocente");
      setIdDocente(id);
    }
  }, []);

  // Función para obtener los archivos del docente desde la API
  const fetchArchivosDocente = async () => {
    try {
      const response = await fetch(`http://localhost:4321/api/docentes/${idDocente}`);
      if (!response.ok) {
        throw new Error("Error al obtener los archivos del docente");
      }
      const data = await response.json();
      setArchivosDocente(data.archivosdocente);
    } catch (error) {
      console.error("Hubo un problema al obtener los archivos del docente:", error);
    }
  };

  // Cargar los archivos del docente cuando el idDocente esté disponible
  useEffect(() => {
    if (idDocente) {
      fetchArchivosDocente();
    }
  }, [idDocente]);

  // Agrupar archivos por categoría
  const archivosPorCategoria = archivosDocente.reduce((acc, archivo) => {
    const categoria = archivo.tipoArchivo || "Sin categoría";
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(archivo);
    return acc;
  }, {});

  // Asegurar que todas las categorías predefinidas estén presentes
  categoriasPredefinidas.forEach((categoria) => {
    if (!archivosPorCategoria[categoria]) {
      archivosPorCategoria[categoria] = [];
    }
  });

  // Función para manejar la edición de un archivo
  const handleEdit = (archivo) => {
    setArchivoParaEditar(archivo);
    setCurrentSection(archivo.tipoArchivo);
    setIsModalOpen(true);
  };

// Función para manejar la eliminación de un archivo
const handleDelete = async (archivo) => {
  if (!window.confirm(`¿Estás seguro que deseas eliminar el archivo "${archivo.nombreArchivo}"?`)) {
    return;
  }

  try {
    const response = await fetch("/api/archivos/delete_archivos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idArchivo: archivo.idArchivo }),
    });

    const data = await response.json();

    if (response.ok) {
      // Mostrar mensaje de éxito y actualizar la lista
      alert(data.message);
      fetchArchivosDocente();
    } else {
      alert(data.error || "Error al eliminar el archivo");
    }
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    alert("Error al conectar con el servidor");
  }
};

  const handleOpenModal = (section) => {
    setCurrentSection(section);
    setArchivoParaEditar(null); // Asegurarse de que no hay archivo para editar
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSection("");
    setArchivoParaEditar(null);
    fetchArchivosDocente(); // Recargar los archivos después de subir uno nuevo
  };

  // Estilos generales
  const styles = {
    container: {
      marginTop: "20px",
      width: "95%",
      marginLeft: "10px",
      padding: "20px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      maxHeight: "600px",
      overflowY: "auto",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#002f6c",
      textAlign: "center",
      marginBottom: "20px",
    },
    sectionTitle: {
      fontSize: "23px",
      fontWeight: "bold",
      color: "#444",
      marginBottom: "10px",
    },
    paragraph: {
      margin: "5px 0",
      color: "#555",
      fontWeight: "bold",
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginBottom: "10px",
    },
    archivoLista: {
      listStyle: "none",
      padding: "0",
    },
    archivoItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "10px",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "5px",
    },
    archivoLink: {
      color: "#007bff",
      textDecoration: "none",
      flex: 1,
    },
    archivoFecha: {
      fontSize: "12px",
      color: "#777",
    },
    iconContainer: {
      display: "flex",
      gap: "10px",
    },
    iconButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#555",
    },
    mensajeVacio: {
      color: "#888",
      fontStyle: "italic",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Archivos Docente</h1>

      {categoriasPredefinidas.map((categoria) => (
        <div key={categoria} style={{ marginBottom: "20px" }}>
          <h2 style={styles.sectionTitle}>
            {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          </h2>
          {archivosPorCategoria[categoria].length > 0 ? (
            <ul style={styles.archivoLista}>
              {archivosPorCategoria[categoria].map((archivo) => (
                <li key={archivo.idArchivo} style={styles.archivoItem}>
                  <a
                    href={archivo.rutaArchivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.archivoLink}
                  >
                    {archivo.nombreArchivo}
                  </a>
                  <p style={styles.archivoFecha}>
                    Subido el: {new Date(archivo.fechaSubida).toLocaleString()}
                  </p>
                  <div style={styles.iconContainer}>
                    <button
                      style={styles.iconButton}
                      onClick={() => handleEdit(archivo)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      style={styles.iconButton}
                      onClick={() => handleDelete(archivo)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.mensajeVacio}>No hay archivos subidos</p>
          )}
          <button style={styles.button} onClick={() => handleOpenModal(categoria)}>
            Subir {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          </button>
        </div>
      ))}

{isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          title={archivoParaEditar ? `Editar ${currentSection}` : `Subir ${currentSection}`}
        >
          <UploadFile 
            tipoArchivo={currentSection} 
            archivoParaEditar={archivoParaEditar}
            onUploadComplete={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};