import React, { useState, useEffect } from "react";
import "./style/CourseForm.css";

interface Experiencia {
  idExperiencia: number;
  materia: string;
  calidad: string;
  universidad: string;
  concluidoEl: string;
}

interface ExperienciaDocente {
  idDocente: number;
  experienciasDocente: (Experiencia | null)[];
}

const ExperienciaDocenteManager: React.FC = () => {
  const [idDocente, setIdDocente] = useState<number | null>(null);
  const [experienciasDocente, setExperienciasDocente] = useState<(Experiencia | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [newExperiencia, setNewExperiencia] = useState<Experiencia>({
    idExperiencia: 0,
    materia: "",
    calidad: "",
    universidad: "",
    concluidoEl: "",
  });
  const [editingExperiencia, setEditingExperiencia] = useState<Experiencia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);

  useEffect(() => {
    const fetchDocenteData = async () => {
      const docenteId = localStorage.getItem("idDocente");
      if (!docenteId) {
        alert("No se encontró el ID del docente en localStorage");
        return;
      }

      setIdDocente(Number(docenteId));
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:4321/api/docentes/${docenteId}`);
        if (!response.ok) throw new Error("Error al obtener datos del docente");

        const data = await response.json();
        console.log("Datos recibidos de la API:", data);

        if (data.experienciasdocentes && Array.isArray(data.experienciasdocentes)) {
          setExperienciasDocente(data.experienciasdocentes);
        } else {
          console.error("Formato de datos incorrecto:", data);
          alert("No se encontraron experiencias docentes o el formato es incorrecto.");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocenteData();
  }, []);

  const handleSaveInfo = async () => {
    if (idDocente === null) {
      alert("ID del docente no encontrado");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/expdoc/expdocpost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idDocente: idDocente,
          experienciasDocente: [newExperiencia],
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setExperienciasDocente(updatedData.experienciasDocente);
        alert("Nueva experiencia docente agregada con éxito");
        setNewExperiencia({
          idExperiencia: 0,
          materia: "",
          calidad: "",
          universidad: "",
          concluidoEl: "",
        });
        setIsModalOpen(false); // Cerrar la modal al guardar
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        alert("Hubo un error al agregar la experiencia docente");
      }
    } catch (error) {
      console.error("Error en el cliente:", error);
      alert("Hubo un error al agregar la experiencia docente");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async () => {
    if (idDocente === null || editingExperiencia === null) {
      alert("No se puede actualizar la experiencia docente");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/expdoc/expdocput", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idDocente: idDocente,
          experienciasDocente: [
            {
              idExperienciaDocente: editingExperiencia.idExperiencia,
              materia: editingExperiencia.materia,
              calidad: editingExperiencia.calidad,
              universidad: editingExperiencia.universidad,
              concluidoEl: editingExperiencia.concluidoEl,
            },
          ],
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setExperienciasDocente(updatedData.experienciasDocente);
        alert("Experiencia docente actualizada con éxito");
        setEditingExperiencia(null);
        setIsModalOpen(false); // Cerrar la modal al actualizar
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        alert("Hubo un error al actualizar la experiencia docente");
      }
    } catch (error) {
      console.error("Error en el cliente:", error);
      alert("Hubo un error al actualizar la experiencia docente");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exp?: Experiencia) => {
    if (exp) {
      setEditingExperiencia(exp);
      setIsEditModal(true);
    } else {
      setIsEditModal(false);
      setNewExperiencia({
        idExperiencia: 0,
        materia: "",
        calidad: "",
        universidad: "",
        concluidoEl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExperiencia(null);
  };

  return (
    <div className="experiencia-docente-container">
      <h1 className="experiencia-docente-title">Gestión de Experiencia Docente</h1>
  
      {loading && <p className="experiencia-docente-loading">Cargando...</p>}
  
      <h2 className="experiencia-docente-subtitle">Experiencias actuales</h2>
      {experienciasDocente.filter(exp => exp !== null).length > 0 ? (
        <ul className="experiencia-docente-list">
          {experienciasDocente
            .filter(exp => exp !== null)
            .map((exp, index) => (
              // Como ya filtramos, 'exp' ya es no nulo
              <li key={exp!.idExperiencia} className="experiencia-docente-item">
                <strong>Materia:</strong> {exp!.materia}, <strong>Calidad:</strong> {exp!.calidad},{" "}
                <strong>Universidad:</strong> {exp!.universidad}, <strong>Concluido el:</strong>{" "}
                {new Date(exp!.concluidoEl).toLocaleDateString()}{" "}
                <button
                  className="experiencia-docente-button editar-button"
                  onClick={() => handleOpenModal(exp!)}
                >
                  Editar
                </button>
              </li>
            ))}
        </ul>
      ) : (
        <p className="experiencia-docente-empty">No hay experiencias docentes registradas.</p>
      )}
  
      <button
        className="experiencia-docente-button agregar-button"
        onClick={() => handleOpenModal()}
      >
        Agregar nueva experiencia
      </button>
  
      {isModalOpen && (
        <div className="modal-curse">
          <div className="modal-content-curse">
            <h2 className="modal-title-curse">
              {isEditModal ? "Editar experiencia docente" : "Agregar nueva experiencia docente"}
            </h2>
            <form
              className="experiencia-docente-form"
              onSubmit={(e) => {
                e.preventDefault();
                isEditModal ? handleUpdateInfo() : handleSaveInfo();
              }}
            >
              <div className="form-group">
                <label className="form-label">Materia:</label>
                <input
                  className="form-input"
                  type="text"
                  value={isEditModal ? editingExperiencia?.materia : newExperiencia.materia}
                  onChange={(e) => {
                    const value = e.target.value;
                    isEditModal
                      ? setEditingExperiencia((prev) => prev && { ...prev, materia: value })
                      : setNewExperiencia((prev) => ({ ...prev, materia: value }));
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Calidad:</label>
                <input
                  className="form-input"
                  type="text"
                  value={isEditModal ? editingExperiencia?.calidad : newExperiencia.calidad}
                  onChange={(e) => {
                    const value = e.target.value;
                    isEditModal
                      ? setEditingExperiencia((prev) => prev && { ...prev, calidad: value })
                      : setNewExperiencia((prev) => ({ ...prev, calidad: value }));
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Universidad:</label>
                <input
                  className="form-input"
                  type="text"
                  value={isEditModal ? editingExperiencia?.universidad : newExperiencia.universidad}
                  onChange={(e) => {
                    const value = e.target.value;
                    isEditModal
                      ? setEditingExperiencia((prev) => prev && { ...prev, universidad: value })
                      : setNewExperiencia((prev) => ({ ...prev, universidad: value }));
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de conclusión:</label>
                <input
                  className="form-input"
                  type="date"
                  value={isEditModal ? editingExperiencia?.concluidoEl : newExperiencia.concluidoEl}
                  onChange={(e) => {
                    const value = e.target.value;
                    isEditModal
                      ? setEditingExperiencia((prev) => prev && { ...prev, concluidoEl: value })
                      : setNewExperiencia((prev) => ({ ...prev, concluidoEl: value }));
                  }}
                  required
                />
              </div>
              <button className="experiencia-docente-button guardar-button" type="submit">
                {isEditModal ? "Actualizar" : "Guardar"}
              </button>
              <button
                className="experiencia-docente-button cancelar-button"
                type="button"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienciaDocenteManager;
