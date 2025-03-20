import React, { useState, useEffect } from "react";
import { Modal } from "../../util/modale"; // Importa el componente Modal existente
import "./metricas.css"; // Importa el archivo CSS específico para las métricas

interface Criterio {
  id_criterio: number;
  criterio: string;
}

interface Metrica {
  idMetricas: string;
  fecha: string;
  criterio: string;
  cotejo: string;
  observaciones: string;
  recomendaciones: string;
}

interface MetricasButtonProps {
  docenteId: number;
}

export const MetricasButton: React.FC<MetricasButtonProps> = ({ docenteId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [tipoEvaluacion, setTipoEvaluacion] = useState<"Tutor" | "Docente" | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [resultadosCriterios, setResultadosCriterios] = useState<Record<number, string>>({});
  const [metricasGuardadas, setMetricasGuardadas] = useState<Metrica[] | null>(null);

  // Función para obtener los criterios desde la API
  const fetchCriterios = async () => {
    try {
      const response = await fetch("/api/docentes/evaluacion/criterios");
      if (!response.ok) {
        throw new Error("Error al obtener los criterios");
      }
      const data = await response.json();
      setCriterios(data);
    } catch (error) {
      console.error("Error fetching criterios:", error);
    }
  };

  // Función para obtener las métricas guardadas desde la API
  const fetchMetricasGuardadas = async () => {
    try {
      const response = await fetch(`/api/docentes/${docenteId}`);
      if (!response.ok) {
        throw new Error("Error al obtener las métricas guardadas");
      }
      const data = await response.json();
      // Verifica si hay métricas guardadas
      if (data.metricas && data.metricas.length > 0) {
        setMetricasGuardadas(data.metricas);
      } else {
        setMetricasGuardadas(null); // No hay métricas guardadas
      }
    } catch (error) {
      console.error("Error fetching métricas guardadas:", error);
    }
  };

  // Cuando se abre la modal, obtenemos los criterios y las métricas guardadas
  useEffect(() => {
    if (isModalOpen) {
      fetchCriterios();
      fetchMetricasGuardadas();
    }
  }, [isModalOpen]);

  // Cargar los datos guardados en el formulario
  useEffect(() => {
    if (metricasGuardadas && metricasGuardadas.length > 0) {
      // Cargar observaciones y recomendaciones (tomamos el primer registro)
      setObservaciones(metricasGuardadas[0].observaciones || "");
      setRecomendaciones(metricasGuardadas[0].recomendaciones || "");

      // Cargar los resultados de los criterios
      const resultados = metricasGuardadas.reduce((acc, metrica) => {
        const criterio = criterios.find((c) => c.criterio === metrica.criterio);
        if (criterio) {
          acc[criterio.id_criterio] = metrica.cotejo;
        }
        return acc;
      }, {} as Record<number, string>);

      setResultadosCriterios(resultados);
    }
  }, [metricasGuardadas, criterios]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTipoEvaluacion(null); // Resetear el tipo de evaluación al cerrar la modal
    setObservaciones(""); // Limpiar observaciones
    setRecomendaciones(""); // Limpiar recomendaciones
    setResultadosCriterios({}); // Limpiar resultados de criterios
    setMetricasGuardadas(null); // Limpiar métricas guardadas
  };

  // Manejar cambios en los radio buttons
  const handleCriterioChange = (idCriterio: number, cotejo: string) => {
    setResultadosCriterios((prev) => ({
      ...prev,
      [idCriterio]: cotejo,
    }));
  };

  // Función para guardar o editar las métricas
  const handleGuardar = async () => {
    try {
      const criteriosParaGuardar = Object.entries(resultadosCriterios).map(
        ([idCriterio, cotejo]) => ({
          idCriterio: parseInt(idCriterio),
          cotejo,
        })
      );
  
      // Determinar si es una edición o una creación
      const metodo = metricasGuardadas ? "PUT" : "POST";
      const url = metricasGuardadas
        ? `/api/docentes/evaluacion/${docenteId}`
        : "/api/docentes/evaluacion/guardar";
  
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idDocente: docenteId,
          observaciones: observaciones || null,
          recomendaciones: recomendaciones || null,
          criterios: criteriosParaGuardar,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Error al guardar/editar las métricas");
      }
  
      alert(metricasGuardadas ? "Métricas actualizadas correctamente" : "Métricas guardadas correctamente");
      handleCloseModal(); // Cerrar la modal después de guardar/editar
    } catch (error) {
      console.error("Error al guardar/editar las métricas:", error);
      alert("Hubo un error al guardar/editar las métricas");
    }
  };

  // Criterios especiales (Cumple/No Cumple)
  const criteriosEspeciales = [
    "Disposicion de tiempo",
    "Dominio en el manejo de la plataforma moodle",
    "Conformidad del Servicio de honorarios",
  ];

  // Filtrar los criterios según el tipo de evaluación
  const criteriosFiltrados = criterios.filter((criterio) => {
    if (tipoEvaluacion === "Tutor") {
      return criterio.criterio !== "Competencias"; // Excluir "Competencias" si es Tutor
    } else if (tipoEvaluacion === "Docente") {
      return criterio.criterio !== "Lineas de investigacion"; // Excluir "Lineas de investigacion" si es Docente
    }
    return true; // Mostrar todos los criterios si no se ha seleccionado un tipo
  });

  // Separar los criterios en normales y especiales
  const criteriosNormales = criteriosFiltrados.filter(
    (criterio) => !criteriosEspeciales.includes(criterio.criterio)
  );
  const criteriosEspecialesFiltrados = criteriosFiltrados.filter((criterio) =>
    criteriosEspeciales.includes(criterio.criterio)
  );

  return (
    <div>
      {/* Botón para abrir la modal */}
      <button onClick={handleOpenModal} className="metricas-button">
        METRICAS
      </button>

      {/* Modal para mostrar las métricas */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Métricas de Evaluación">
        <div className="metricas-container">
          {/* Mostrar selección de tipo de evaluación solo si no hay métricas guardadas */}
          {!metricasGuardadas && (
            <div className="tipo-evaluacion-group">
              <label>
                <input
                  type="radio"
                  name="tipoEvaluacion"
                  value="Tutor"
                  checked={tipoEvaluacion === "Tutor"}
                  onChange={() => setTipoEvaluacion("Tutor")}
                />
                Tutor
              </label>
              <label>
                <input
                  type="radio"
                  name="tipoEvaluacion"
                  value="Docente"
                  checked={tipoEvaluacion === "Docente"}
                  onChange={() => setTipoEvaluacion("Docente")}
                />
                Docente
              </label>
            </div>
          )}

          {/* Mostrar el formulario si hay métricas guardadas o si se ha seleccionado un tipo de evaluación */}
          {(metricasGuardadas || tipoEvaluacion) && (
            <div>
              {/* Criterios normales */}
              {criteriosNormales.map((criterio) => (
                <div key={criterio.id_criterio} className="criterio-container">
                  <p className="criterio-title">{criterio.criterio}</p>
                  <div className="radio-group">
                    {["Excelente", "Bueno", "Regular", "Deficiente"].map((valor) => (
                      <label key={valor}>
                        <input
                          type="radio"
                          name={`criterio-${criterio.id_criterio}`}
                          value={valor}
                          checked={resultadosCriterios[criterio.id_criterio] === valor}
                          onChange={() => handleCriterioChange(criterio.id_criterio, valor)}
                        />
                        {valor}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Criterios especiales (Cumple/No Cumple) */}
              {criteriosEspecialesFiltrados.map((criterio) => (
                <div key={criterio.id_criterio} className="criterio-container">
                  <p className="criterio-title">{criterio.criterio}</p>
                  <div className="radio-group">
                    {["Cumple", "No Cumple"].map((valor) => (
                      <label key={valor}>
                        <input
                          type="radio"
                          name={`criterio-${criterio.id_criterio}`}
                          value={valor}
                          checked={resultadosCriterios[criterio.id_criterio] === valor}
                          onChange={() => handleCriterioChange(criterio.id_criterio, valor)}
                        />
                        {valor}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Campos de observaciones y recomendaciones */}
              <div className="criterio-container">
                <p className="criterio-title">Observaciones</p>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                  className="textarea"
                />
              </div>
              <div className="criterio-container">
                <p className="criterio-title">Recomendaciones</p>
                <textarea
                  value={recomendaciones}
                  onChange={(e) => setRecomendaciones(e.target.value)}
                  rows={4}
                  className="textarea"
                />
              </div>

              {/* Botón para guardar */}
              <button onClick={handleGuardar} className="guardar-button">
                {metricasGuardadas ? "Actualizar" : "Guardar"}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};