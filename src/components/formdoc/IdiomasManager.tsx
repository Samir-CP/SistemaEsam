import React, { useState, useEffect } from "react";
import "./style/IdiomasManager.css";
import IdiomasSelect from "../perfil-doc/IdiomasSelect";

interface Idioma {
  idIdiomaDocente?: string;
  idIdioma: string;
  idioma: string;
  escritura: number | string;  // Acepta ambos tipos
  oral: number | string;
  lectura: number | string;
  escucha: number | string;
}

interface DocenteData {
  idDocente: string;
  // Si la API pudiera retornar elementos nulos, definimos el arreglo como (Idioma | null)[]
  idiomas: (Idioma | null)[];
}

const IdiomasManager: React.FC = () => {
  const [docenteData, setDocenteData] = useState<DocenteData | null>(null);
  const [newIdioma, setNewIdioma] = useState<Idioma>({
    idIdioma: "",
    idioma: "",
    escritura: 1,
    oral: 1,
    lectura: 1,
    escucha: 1,
  });
  const [selectedIdioma, setSelectedIdioma] = useState<Idioma | null>(null);
  const [idDocente, setIdDocente] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Cargar datos del docente al montar el componente
  useEffect(() => {
    const fetchDocenteData = async () => {
      const docenteId = localStorage.getItem("idDocente");
      if (!docenteId) {
        alert("No se encontró el ID del docente en localStorage");
        return;
      }

      setIdDocente(docenteId);
      setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:4321/api/docentes/${docenteId}`
        );
        if (!response.ok) throw new Error("Error al obtener datos del docente");
        const data = await response.json();
        setDocenteData(data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocenteData();
  }, []);

  // Manejar cambios en el nuevo idioma (para niveles numéricos)
  const handleNewIdiomaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIdioma({ ...newIdioma, [name]: parseInt(value) });
  };

  // Manejar cambios en el idioma seleccionado para editar
  const handleEditIdiomaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedIdioma) {
      const { name, value } = e.target;
      setSelectedIdioma({ 
        ...selectedIdioma, 
        [name]: parseInt(value) 
      });
    }
  };

  // Abrir modal de agregar idioma
  const openAddModal = () => {
    setNewIdioma({
      idioma: "",
      idIdioma: "",
      escritura: 1,
      oral: 1,
      lectura: 1,
      escucha: 1,
    });
    setShowAddModal(true);
  };

  // Cerrar modal de agregar idioma
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  // Abrir modal de editar idioma
  const openEditModal = (idioma: Idioma) => {
    setSelectedIdioma({
      ...idioma,
      // Convertir strings a números si es necesario
      escritura: typeof idioma.escritura === 'string' ? parseInt(idioma.escritura) : idioma.escritura,
      oral: typeof idioma.oral === 'string' ? parseInt(idioma.oral) : idioma.oral,
      lectura: typeof idioma.lectura === 'string' ? parseInt(idioma.lectura) : idioma.lectura,
      escucha: typeof idioma.escucha === 'string' ? parseInt(idioma.escucha) : idioma.escucha
    });
    setShowEditModal(true);
  };
  // Cerrar modal de editar idioma
  const closeEditModal = () => {
    setShowEditModal(false);
  };

  // Crear un nuevo idioma (POST)
  const handleAddIdioma = async () => {
    if (!idDocente) {
      alert("No se encontró el ID del docente");
      return;
    }

    try {
      const response = await fetch("/api/idiomasdoc/idiomasdocpost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idDocente,
          idiomas: [newIdioma],
        }),
      });

      if (!response.ok) throw new Error("Error al crear el idioma");

      alert("Idioma creado con éxito");
      setNewIdioma({
        idioma: "",
        idIdioma: "",
        escritura: 1,
        oral: 1,
        lectura: 1,
        escucha: 1,
      });
      const updatedData = await response.json();
      setDocenteData(updatedData);
      closeAddModal();
    } catch (error) {
      console.error("Error al agregar idioma:", error);
    }
  };

  // Actualizar un idioma (PUT)
  const handleUpdateIdioma = async () => {
    if (!idDocente || !selectedIdioma) {
      alert("No se encontró el ID del docente o el idioma seleccionado");
      return;
    }
  
    try {
      // Convertir todos los valores a números
      const idiomaParaEnviar = {
        ...selectedIdioma,
        escritura: Number(selectedIdioma.escritura),
        oral: Number(selectedIdioma.oral),
        lectura: Number(selectedIdioma.lectura),
        escucha: Number(selectedIdioma.escucha)
      };
  
      const response = await fetch("/api/idiomasdoc/idiomasdocput", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idDocente,
          idiomas: [idiomaParaEnviar],
        }),
      });
  
      if (!response.ok) throw new Error("Error al actualizar el idioma");
  
      alert("Idioma actualizado con éxito");
      const updatedData = await response.json();
      setDocenteData(updatedData);
      closeEditModal();
    } catch (error) {
      console.error("Error al actualizar idioma:", error);
    }
  };

  const getLevelText = (level: string | number | undefined) => {
    const numLevel = Number(level);
    switch (numLevel) {
      case 3:
        return "Alto";
      case 2:
        return "Medio";
      case 1:
        return "Bajo";
      default:
        return "No especificado";
    }
  };

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div className="idiomas-manager">
      <h1>Gestión de Idiomas</h1>
      <button onClick={openAddModal} className="button add-button">
        Agregar Idioma
      </button>
      {/* Lista de idiomas, filtrando posibles elementos nulos */}
      <div className="idiomas-list">
        {docenteData?.idiomas
          .filter((idioma) => idioma !== null)
          .map((idioma) => (
            <div
              key={idioma!.idIdiomaDocente || idioma!.idIdioma}
              className="idioma-card"
            >
              <p>
                <strong>Idioma:</strong> {idioma!.idioma}
              </p>
              <p>
                <strong>Escritura:</strong> {getLevelText(idioma!.escritura)}
              </p>
              <p>
                <strong>Oral:</strong> {getLevelText(idioma!.oral)}
              </p>
              <p>
                <strong>Lectura:</strong> {getLevelText(idioma!.lectura)}
              </p>
              <p>
                <strong>Escucha:</strong> {getLevelText(idioma!.escucha)}
              </p>
              <button
                onClick={() => openEditModal(idioma!)}
                className="button edit-button"
              >
                Editar
              </button>
            </div>
          ))}
      </div>
      {/* Modal de Agregar Idioma */}
      {showAddModal && (
        <div className="modalidioma-add-overlay">
          <div className="modalidioma-add">
            <h2>Agregar Nuevo Idioma</h2>
            <IdiomasSelect
              selectedIdioma={{
                id: parseInt(newIdioma.idIdioma || "0"),
                name: newIdioma.idioma,
              }}
              onIdiomaChange={(selected) =>
                setNewIdioma({
                  ...newIdioma,
                  idIdioma: selected.id.toString(),
                  idioma: selected.name,
                })
              }
              valueAndId="idIdioma"
              selected={newIdioma.idioma}
              selectedId={parseInt(newIdioma.idIdioma || "0")}
            />
            {/* Checkboxes para los niveles */}
            {["escritura", "oral", "lectura", "escucha"].map((field) => (
              <div key={field} className="modalidioma-add-checkbox-group">
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {["Alto", "Medio", "Bajo"].map((level, index) => (
                  <div key={index}>
                    <input
                      type="radio"
                      name={field}
                      value={3 - index}
                      checked={newIdioma[field as keyof Idioma] === 3 - index}
                      onChange={handleNewIdiomaChange}
                    />
                    <label>{level}</label>
                  </div>
                ))}
              </div>
            ))}
            <button
              className="modalidioma-add-button"
              onClick={handleAddIdioma}
            >
              Agregar
            </button>
            <button
              className="modalidioma-add-button-close"
              onClick={closeAddModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      {/* Modal de Editar Idioma */}

      {showEditModal && selectedIdioma && (
  <div className="modalidioma-add-overlay">
    <div className="modalidioma-add">
      <h2>Editar Idioma</h2>
      <input
        type="text"
        name="idioma"
        placeholder="Idioma"
        value={selectedIdioma.idioma}
        onChange={handleEditIdiomaChange}
        disabled
      />
      {/* Checkboxes para los niveles */}
      {["escritura", "oral", "lectura", "escucha"].map((field) => (
        <div key={field} className="modalidioma-add-checkbox-group">
          <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          {[3, 2, 1].map((value) => (
            <div key={value}>
              <input
                type="radio"
                name={field}
                value={value}
                checked={Number(selectedIdioma[field as keyof Idioma]) === value}
                onChange={handleEditIdiomaChange}
              />
              <label>{getLevelText(value)}</label>
            </div>
          ))}
        </div>
      ))}
      <button className="modalidioma-add-button" onClick={handleUpdateIdioma}>
        Actualizar
      </button>
      <button
        className="modalidioma-add-button-close"
        onClick={closeEditModal}
      >
        Cerrar
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default IdiomasManager;
