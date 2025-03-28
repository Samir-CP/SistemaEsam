import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

export const UploadFile = ({ tipoArchivo, archivoParaEditar, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [message, setMessage] = useState("");
  const [idDocente, setIdDocente] = useState(null);
  const [docenteNombre, setDocenteNombre] = useState(null);
  const [tiposArchivo, setTiposArchivo] = useState([]);
  const [selectedTipoArchivoId, setSelectedTipoArchivoId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setIdDocente(decoded.idDocente);
        setDocenteNombre(decoded.nombre);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    } else {
      console.error("Token no encontrado. Por favor, inicia sesión.");
    }
  }, []);

  useEffect(() => {
    const fetchTiposArchivo = async () => {
      try {
        const response = await fetch("/api/dashboard/get_tipos_archivos");
        const data = await response.json();
        if (response.ok) {
          setTiposArchivo(data);
          const tipoEncontrado = data.find(
            (tipo) => tipo.tipo.toLowerCase() === tipoArchivo.toLowerCase()
          );
          if (tipoEncontrado) {
            setSelectedTipoArchivoId(tipoEncontrado.id_ta);
          } else {
            setMessage(`No se encontró un tipo de archivo llamado '${tipoArchivo}'.`);
          }
        } else {
          console.error("Error al obtener tipos de archivo:", data.error);
        }
      } catch (error) {
        console.error("Error al llamar a la API:", error);
      }
    };

    fetchTiposArchivo();
  }, [tipoArchivo]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    validateFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    validateFiles(files);
  };

  const validateFiles = (files) => {
    const maxSize = 2 * 1024 * 1024; // 2 MB
    const validFiles = files.filter((file) => file.size <= maxSize);
    const invalidFiles = files.filter((file) => file.size > maxSize);

    if (invalidFiles.length > 0) {
      setMessage("Algunos archivos superan el tamaño máximo de 2 MB y no se agregarán.");
    }

    setSelectedFiles(validFiles); // Reemplazar en lugar de agregar
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setMessage("Por favor, selecciona uno o más archivos válidos.");
      return;
    }

    if (!idDocente || !docenteNombre) {
      setMessage("No se pudo obtener la información del docente.");
      return;
    }

    if (!selectedTipoArchivoId) {
      setMessage("No se ha seleccionado un tipo de archivo válido.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("docente_id", idDocente);
      formData.append("docente_name", docenteNombre);
      formData.append("archivo", selectedFiles[0]); // Solo el primer archivo para edición
      formData.append("idtipo_archivo", selectedTipoArchivoId);

      // Si estamos editando, agregamos el idArchivo
      if (archivoParaEditar) {
        formData.append("idArchivo", archivoParaEditar.idArchivo);
      }

      const endpoint = archivoParaEditar 
        ? "/api/archivos/update_archivos" 
        : "/api/archivos/insert_archivos";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Archivo subido con éxito");
        setSelectedFiles([]);
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        setMessage(data.error || "Error al subir el archivo");
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setMessage("Error al conectar con el servidor");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>{archivoParaEditar ? `Editar ${tipoArchivo}` : `Subir ${tipoArchivo}`}</h3>
      
      {archivoParaEditar && (
        <div style={{ marginBottom: "15px" }}>
          <p>Archivo actual: {archivoParaEditar.nombreArchivo}</p>
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #ccc",
          padding: "100px",
          marginBottom: "20px",
          borderRadius: "8px",
          background: "#f9f9f9",
          cursor: "pointer",
        }}
      >
        {selectedFiles.length > 0 ? (
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        ) : (
          <p>Arrastra tu nuevo archivo aquí o haz clic para seleccionarlo</p>
        )}
        <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="file-input" />
        <label htmlFor="file-input" style={{ color: "#007BFF", cursor: "pointer", fontSize:"21px" }}>
          Seleccionar archivo
        </label>
      </div>

      <button onClick={handleUpload} disabled={!selectedFiles.length}>
        {archivoParaEditar ? "Actualizar Archivo" : "Subir Archivo"}
      </button>

      {message && <p style={{ color: message.includes("Error") ? "red" : "green" }}>{message}</p>}
    </div>
  );
};