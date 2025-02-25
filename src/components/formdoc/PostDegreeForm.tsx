import React, { useState, useEffect } from "react";
import "../formdoc/style/Form2.css";
import CountrySelect from "../perfil-doc/CountrySelect";
import ModalidadesSelect from "../perfil-doc/ModalidadesSelect";
import GradosSelect from "../perfil-doc/GradosSelect";
import TypesSelect from "../perfil-doc/TipoEstudios";

interface EstudioSuperior {
  idEstudio: number | null; // null para nuevos registros
  universidad: string;
  carrera: string;
  fecha: string;
  nombre: string;
  idPais: number;
  pais: string;
  idGrado: number;
  gradoTipo: string;
  idModalidad: number;
  modalidad: string;
  idTipoEstudio: number;
  tipo: string;
}

interface DocenteData {
  idDocente: number;
  estudiosuperiores: EstudioSuperior[];
}

const FormularioDocente: React.FC = () => {
  const [docenteData, setDocenteData] = useState<DocenteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [showAll, setShowAll] = useState<boolean>(false); // Controla si se muestran todas las cards
  const [selectedEstudio, setSelectedEstudio] =
    useState<EstudioSuperior | null>(null);

  // Cargar datos del docente
  useEffect(() => {
    const fetchDocenteData = async () => {
      const docenteId = localStorage.getItem("idDocente");
      if (!docenteId) {
        console.error("No se encontró el idDocente en el localStorage.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:4321/api/docentes/${docenteId}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener datos del docente");
        }

        const data: DocenteData = await response.json();
        setDocenteData(data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocenteData();
  }, []);

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  if (!docenteData) {
    return <p>Error: No se pudieron cargar los datos del docente.</p>;
  }

  const { idDocente, estudiosuperiores } = docenteData;

  // Manejar cambios en los campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    if (selectedEstudio) {
      setSelectedEstudio({
        ...selectedEstudio,
        [field]: e.target.value,
      });
    }
  };

  const handleSave = async () => {
    if (!selectedEstudio) return;

    try {
      if (selectedEstudio.idEstudio === null) {
        const response = await fetch(`/api/estudiossuppost`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idDocente, // Incluimos el ID del docente
            estudiossuperiores: [
              {
                universidad: selectedEstudio.universidad,
                carrera: selectedEstudio.carrera,
                fecha: selectedEstudio.fecha,
                nombre: selectedEstudio.nombre,
                idPais: Number(selectedEstudio.idPais),
                idGrado: Number(selectedEstudio.idGrado),
                idModalidad: Number(selectedEstudio.idModalidad),
                idTipoEstudio: Number(selectedEstudio.idTipoEstudio),
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear el estudio");
        }

        const result = await response.json();
        setMessage(result.message || "Estudio creado correctamente");

        // Actualizar el estado con el ID del nuevo estudio
        setDocenteData((prevData) =>
          prevData
            ? {
                ...prevData,
                estudiossuperiores: prevData.estudiosuperiores.map((e) =>
                  e === selectedEstudio
                    ? { ...selectedEstudio, idEstudio: result.idEstudio }
                    : e
                ),
              }
            : null
        );
      } else {
        // Si el estudio ya existe (tiene un ID), hacemos un PUT
        const response = await fetch(`/api/estudiossup`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idDocente,
            idEstudioSuperior: selectedEstudio.idEstudio,
            updateFields: {
              universidad: selectedEstudio.universidad,
              carrera: selectedEstudio.carrera,
              fecha: selectedEstudio.fecha,
              nombre: selectedEstudio.nombre,
              idPais: selectedEstudio.idPais,
              idGrado: selectedEstudio.idGrado,
              idModalidad: selectedEstudio.idModalidad,
              idTipoEstudio: selectedEstudio.idTipoEstudio,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el estudio");
        }

        const result = await response.json();
        setMessage(result.message || "Estudio actualizado correctamente");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al guardar el estudio");
    } finally {
      setSelectedEstudio(null);
    }
  };

  // Crear un nuevo registro vacío y abrir la modal
  const handleCreate = () => {
    const nuevoEstudio: EstudioSuperior = {
      idEstudio: null, // null indica que es un nuevo registro no guardado en la base de datos
      universidad: "",
      carrera: "",
      fecha: "",
      nombre: "",
      idPais: 0,
      pais: "", // ID de país inicial
      idGrado: 0,
      gradoTipo: "", // ID de grado inicial
      idModalidad: 0,
      modalidad: "", // ID de modalidad inicial
      idTipoEstudio: 0,
      tipo: "", // ID de tipo de estudios inicial
    };

    setSelectedEstudio(nuevoEstudio); // Abrir la modal con el nuevo estudio
  };

  // Función para alternar la visibilidad de todas las cards
  const toggleShowAll = () => {
    setShowAll((prev) => !prev);
  };

  return (
    <div className="postdegreeform-container">
      <h3 className="form-title">Información del Docente</h3>
      <button className="toggle-button1" onClick={toggleShowAll}>
        {showAll ? "Mostrar menos" : "Mostrar más"}
      </button>
      <button className="create-button1" onClick={handleCreate}>
        Crear Nuevo Estudio
      </button>
      <p hidden>ID Docente: {idDocente}</p>

      {estudiosuperiores
        .slice(0, showAll ? estudiosuperiores.length : 2) // Muestra solo 2 o todas según el estado
        .map((estudio, index) => (
          <div key={index} className="study-card">
            <h4 className={`study-title ${estudio.idEstudio ? "hidden" : ""}`}>
              Estudio Superior #{estudio.idEstudio || "Nuevo"}
            </h4>
            <div className="study-fields">
              <p>
                <strong>Universidad:</strong> {estudio.universidad}
              </p>
              <p>
                <strong>Carrera:</strong> {estudio.carrera}
              </p>
              <p>
                <strong>Fecha:</strong> {estudio.fecha}
              </p>
              <p>
                <strong>Nombre:</strong> {estudio.nombre}
              </p>
              <p>
                <strong>País:</strong> {estudio.pais}
              </p>
              <p>
                <strong>Grado:</strong> {estudio.gradoTipo}
              </p>
              <p>
                <strong>Modalidad:</strong> {estudio.modalidad}
              </p>
              <p>
                <strong>Tipo de Estudios:</strong> {estudio.tipo}
              </p>
            </div>
            <button
              className="edit-button2"
              onClick={() => setSelectedEstudio(estudio)}
            >
              Editar
            </button>
          </div>
        ))}

      {message && <p className="message-text">{message}</p>}

      {selectedEstudio && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-title">
              <h4>Editar Estudio</h4>
            </div>
            <div>
              <label>Universidad:</label>
              <input
                className="custom-input"
                type="text"
                value={selectedEstudio.universidad}
                onChange={(e) => handleChange(e, "universidad")}
              />
            </div>
            <div>
              <label>Carrera:</label>
              <input
                className="custom-input"
                type="text"
                value={selectedEstudio.carrera}
                onChange={(e) => handleChange(e, "carrera")}
              />
            </div>
            <div>
              <label>Fecha:</label>
              <input
                className="custom-input"
                type="date"
                value={selectedEstudio.fecha} // Asegúrate de que esté en el formato 'YYYY-MM-DD'
                onChange={(e) => handleChange(e, "fecha")}
              />
            </div>
            <div>
              <label>Nombre:</label>
              <input
                className="custom-input"
                type="text"
                value={selectedEstudio.nombre}
                onChange={(e) => handleChange(e, "nombre")}
              />
            </div>
            <div>
              <CountrySelect
                valueAndId="idPais"
                selectedId={selectedEstudio.idPais}
                selected={selectedEstudio?.pais}
                selectedCountry={{
                  id: selectedEstudio?.idPais || 0,
                  name: selectedEstudio?.pais || "", // Asegúrate de que esté el valor correcto aquí
                }}
                onCountryChange={(selectedCountry) => {
                  setSelectedEstudio((prev) =>
                    prev
                      ? {
                          ...prev,
                          idPais: selectedCountry.id,
                          pais: selectedCountry.name,
                        }
                      : null
                  );
                }}
              />
            </div>
            <div>
              <GradosSelect
                valueAndId="idGrado"
                selectedId={selectedEstudio.idGrado}
                selected={selectedEstudio?.gradoTipo}
                selectedGrado={{
                  id: selectedEstudio?.idGrado || 0,
                  name: selectedEstudio?.gradoTipo || "", // Agregar nombre del grado
                }}
                onGradoChange={(selectedGrado) => {
                  setSelectedEstudio((prev) =>
                    prev
                      ? {
                          ...prev,
                          idGrado: selectedGrado.id,
                          gradoTipo: selectedGrado.name,
                        }
                      : null
                  );
                }}
              />
            </div>
            <div>
              <ModalidadesSelect
                valueAndId="idModalidad"
                selectedId={selectedEstudio.idModalidad}
                selected={selectedEstudio?.modalidad}
                selectedModalidad={{
                  id: selectedEstudio?.idModalidad || 0,
                  name: selectedEstudio?.modalidad || "", // Asegúrate de que tenga el nombre de modalidad
                }}
                onModalidadChange={(selectedModalidad) => {
                  setSelectedEstudio((prev) =>
                    prev
                      ? {
                          ...prev,
                          idModalidad: selectedModalidad.id,
                          modalidad: selectedModalidad.name,
                        }
                      : null
                  );
                }}
              />
            </div>
            <div>
              <TypesSelect
                valueAndId="idTipo"
                selectedTypes={{
                  id: selectedEstudio?.idTipoEstudio || 0,
                  name: selectedEstudio?.tipo || "",
                }}
                onTypesChange={(selectedType) => {
                  setSelectedEstudio((prev) =>
                    prev
                      ? {
                          ...prev,
                          idTipo: selectedType.id,
                          tipo: selectedType.name,
                        }
                      : null
                  );
                }}
              />
            </div>
            <button className="save-button" onClick={handleSave}>
              Guardar
            </button>
            <button
              className="cancel-button"
              onClick={() => setSelectedEstudio(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioDocente;