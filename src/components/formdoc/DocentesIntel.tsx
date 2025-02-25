import React, { useState, useEffect } from 'react';
import './style/ProduccionesIntelectualesManager.css'; // Importa tus estilos personalizados
import CountrySelect from "../perfil-doc/CountrySelect";

// Interfaces
interface ProduccionIntelectual {
  idProduccionIntelectual: string;
  nombre: string;
  enlaceEditorial: string;
  idTipoPublicacion: number;
  idPais: number;
  pais: string;
  fecha: string;
}

interface NewProduccion {
  nombre: string;
  enlaceEditorial: string;
  idTipoPublicacion: number;
  idPais: number;
  pais: string;
  fecha: string;
}

const ProduccionesIntelectualesManager: React.FC = () => {
  const [idDocente, setIdDocente] = useState<number | null>(null);
  // Si la API pudiera retornar elementos nulos, definimos el estado como (ProduccionIntelectual | null)[]
  const [producciones, setProducciones] = useState<(ProduccionIntelectual | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newProduccion, setNewProduccion] = useState<NewProduccion>({
    nombre: '',
    enlaceEditorial: '',
    idTipoPublicacion: 0,
    idPais: 0,
    pais: '',
    fecha: '',
  });
  const [editingProduccion, setEditingProduccion] = useState<ProduccionIntelectual | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Cargar datos del docente y sus producciones
  useEffect(() => {
    const fetchDocenteData = async () => {
      const docenteId = localStorage.getItem('idDocente');
      if (!docenteId) {
        alert('No se encontró el ID del docente en localStorage');
        return;
      }

      setIdDocente(Number(docenteId));
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:4321/api/docentes/${docenteId}`);
        if (!response.ok) throw new Error('Error al obtener datos del docente');
        const data = await response.json();
        // Se asume que la API devuelve la propiedad "publicacionesintelectuales"
        setProducciones(data.publicacionesintelectuales || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocenteData();
  }, []);

  // Abrir modal para editar una producción
  const openEditModal = (produccion: ProduccionIntelectual) => {
    setEditingProduccion(produccion);
    setIsModalOpen(true);
  };

  // Cerrar los modales
  const closeModals = () => {
    setIsModalOpen(false);
    setIsCreateModalOpen(false);
    setEditingProduccion(null);
  };

  // Manejar edición (PUT)
  const handleEdit = async () => {
    if (!idDocente || !editingProduccion) return;

    const body = JSON.stringify({
      idDocente,
      produccionesIntelectuales: [editingProduccion],
    });

    try {
      const response = await fetch(`/api/prodintelectual/prodintelput`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!response.ok) throw new Error('Error al actualizar producción intelectual');
      alert('Producción intelectual actualizada correctamente');
      setProducciones((prev) =>
        prev.map((prod) =>
          prod && prod.idProduccionIntelectual === editingProduccion.idProduccionIntelectual
            ? editingProduccion
            : prod
        )
      );
      closeModals();
    } catch (error) {
      console.error('Error en la actualización:', error);
    }
  };

  // Manejar creación (POST)
  const handleCreate = async () => {
    if (!idDocente) return;

    const body = JSON.stringify({
      idDocente,
      produccionesIntelectuales: [newProduccion],
    });

    try {
      const response = await fetch(`/api/prodintelectual/prodintelpost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!response.ok) throw new Error('Error al crear nueva producción intelectual');
      const createdData = await response.json();
      alert('Nueva producción intelectual creada');
      // Se asume que la respuesta trae un array llamado "publicacionesintelectuales"
      setProducciones([...producciones, createdData.publicacionesintelectuales[0]]);
      closeModals();
    } catch (error) {
      console.error('Error en la creación:', error);
    }
  };

  return (
    <div className="producciones-manager">
      <h2>Gestión de Producciones Intelectuales</h2>
      {loading && <p>Cargando datos...</p>}
      {!loading && (
        <>
          <button
            className="create-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Crear Nueva Producción
          </button>
          <div className="producciones-list">
            {/* Filtrar elementos nulos antes de mapear */}
            {producciones.filter(prod => prod !== null).map((produccion) => (
              <div
                className="produccion-item"
                key={produccion!.idProduccionIntelectual}
              >
                <h4>{produccion!.nombre}</h4>
                <p>
                  Enlace Editorial:{' '}
                  <a
                    href={produccion!.enlaceEditorial}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {produccion!.enlaceEditorial}
                  </a>
                </p>
                <p>Tipo de Publicación: {produccion!.idTipoPublicacion}</p>
                <p>País: {produccion!.pais}</p>
                <p>Fecha: {produccion!.fecha}</p>
                <button onClick={() => openEditModal(produccion!)}>Editar</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal para editar */}
      {isModalOpen && editingProduccion && (
        <div className="modal edit-modal">
          <div className="modal-content">
            <h3>Editar Producción Intelectual</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={editingProduccion.nombre}
              onChange={(e) =>
                setEditingProduccion({ ...editingProduccion, nombre: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Enlace Editorial"
              value={editingProduccion.enlaceEditorial}
              onChange={(e) =>
                setEditingProduccion({ ...editingProduccion, enlaceEditorial: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Tipo de Publicación"
              value={editingProduccion.idTipoPublicacion}
              onChange={(e) =>
                setEditingProduccion({
                  ...editingProduccion,
                  idTipoPublicacion: parseInt(e.target.value),
                })
              }
            />
            <div>
              <CountrySelect
                valueAndId="idPais"
                selectedId={editingProduccion.idPais}
                selected={editingProduccion.pais}
                selectedCountry={{
                  id: editingProduccion.idPais || 0,
                  name: editingProduccion.pais || "",
                }}
                onCountryChange={(selectedCountry) => {
                  setEditingProduccion((prev) =>
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
            <input
              type="date"
              value={editingProduccion.fecha}
              onChange={(e) =>
                setEditingProduccion({ ...editingProduccion, fecha: e.target.value })
              }
            />
            <button onClick={handleEdit}>Guardar Cambios</button>
            <button onClick={closeModals}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal para crear */}
      {isCreateModalOpen && (
        <div className="modal create-modal">
          <div className="modal-content">
            <h3>Crear Nueva Producción Intelectual</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={newProduccion.nombre}
              onChange={(e) =>
                setNewProduccion({ ...newProduccion, nombre: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Enlace Editorial"
              value={newProduccion.enlaceEditorial}
              onChange={(e) =>
                setNewProduccion({ ...newProduccion, enlaceEditorial: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Tipo de Publicación"
              value={newProduccion.idTipoPublicacion}
              onChange={(e) =>
                setNewProduccion({
                  ...newProduccion,
                  idTipoPublicacion: parseInt(e.target.value),
                })
              }
            />
            <div>
              <CountrySelect
                valueAndId="idPais"
                selectedId={newProduccion.idPais}
                selected={newProduccion.pais || ""}
                selectedCountry={{
                  id: newProduccion.idPais || 0,
                  name: newProduccion.pais || "",
                }}
                onCountryChange={(selectedCountry) => {
                  setNewProduccion((prev) => ({
                    ...prev,
                    idPais: selectedCountry.id,
                    pais: selectedCountry.name,
                  }));
                }}
              />
            </div>
            <input
              type="date"
              value={newProduccion.fecha}
              onChange={(e) =>
                setNewProduccion({ ...newProduccion, fecha: e.target.value })
              }
            />
            <button onClick={handleCreate}>Crear</button>
            <button onClick={closeModals}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProduccionesIntelectualesManager;
