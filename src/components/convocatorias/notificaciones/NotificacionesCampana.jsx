import React, { useState, useEffect } from "react";

const mensajesNotificaciones = [
  {
    tipo: "postulacion",
    mensaje: "<strong>{docente}</strong> se ha postulado a <strong>{convocatoria}</strong>.",
  },
  {
    tipo: "aprobado",
    mensaje: "<strong>{docente}</strong>, usted ha sido aprobado como docente.",
  },
  // Puedes agregar más tipos de notificaciones aquí
];

const NotificacionesCampana = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNotificaciones, setTotalNotificaciones] = useState(0);
  const [mostrarLista, setMostrarLista] = useState(false);

  // Verificar si el código se ejecuta en el cliente
  const isClient = typeof window !== "undefined";

  // Obtener el idRol y idDocente solo en el cliente
  const idRol = isClient ? localStorage.getItem("idRol") : null;
  const idDocente = isClient ? localStorage.getItem("idDocente") : null;

  const fetchNotificaciones = async () => {
    if (!idRol || (idRol === "4" && !idDocente)) return; // Validar que idRol y idDocente (si es necesario) estén disponibles

    try {
      // Construir la URL con idDocente e idRol
      const url = `/api/convocatorias/notificaciones/select?idDocente=${idDocente}&idRol=${idRol}`;
      const response = await fetch(url);
      const data = await response.json();

      // Actualizar el estado con las notificaciones recibidas
      setNotificaciones(data.notificaciones);

      // Actualizar el contador de notificaciones nuevas
      setTotalNotificaciones(data.totalNotificaciones || 0);
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    }
  };

  const actualizarNotificaciones = async (idsNotificaciones) => {
    try {
      const response = await fetch("/api/convocatorias/notificaciones/updateNotificacion", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idsNotificaciones }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar las notificaciones");
      }

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error("Error al actualizar las notificaciones:", error);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchNotificaciones();
    }
  }, [isClient]);

  const toggleLista = () => {
    if (mostrarLista && totalNotificaciones > 0) {
      // Obtener los IDs de las notificaciones nuevas
      const idsNotificaciones = notificaciones
        .filter((notificacion) => notificacion.estado === "cerrado")
        .map((notificacion) => notificacion.idNotificacion);

      // Solo actualizar si hay notificaciones nuevas
      if (idsNotificaciones.length > 0) {
        // Actualizar el estado de las notificaciones a "leído"
        actualizarNotificaciones(idsNotificaciones);

        // Actualizar el estado local para reflejar que las notificaciones han sido leídas
        setTotalNotificaciones(0);
      }
    }
    setMostrarLista((prev) => !prev);
  };

  const obtenerMensajeNotificacion = (notificacion) => {
    const mensajeObj = mensajesNotificaciones.find((msg) => msg.tipo === notificacion.tipo);
    if (!mensajeObj) return "Notificación sin mensaje definido.";

    // Reemplazar los placeholders con los valores reales
    return mensajeObj.mensaje
      .replace("{docente}", notificacion.docente)
      .replace("{convocatoria}", notificacion.convocatoria || "una convocatoria"); // Manejar convocatoria null
  };

  const handleClickNotificacion = (link) => {
    if (isClient && link) {
      window.location.href = link; // Redirigir a la URL de la convocatoria
    } else {
      console.log("No hay enlace para esta notificación.");
      // Opcional: Mostrar un mensaje al usuario o redirigir a una página predeterminada
    }
  };

  return (
    <div style={{ marginLeft: "auto", position: "relative", display: "inline-block" }}>
      <button
        onClick={toggleLista}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          fontSize: "24px",
        }}
      >
        🔔
        {totalNotificaciones > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
            }}
          >
            {totalNotificaciones}
          </span>
        )}
      </button>

      {mostrarLista && (
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "0",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            width: "350px",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
            {notificaciones.map((notificacion) => (
              <li
                key={notificacion.idNotificacion}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  backgroundColor: notificacion.estado === "cerrado" ? "#bbdefb" : "#f9f9f9", // Estilo diferente para nuevas y leídas
                  transition: "background-color 0.2s",
                  cursor: notificacion.link ? "pointer" : "default", // Cambiar el cursor si no hay enlace
                }}
                onMouseEnter={(e) => {
                  if (notificacion.link) {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (notificacion.link) {
                    e.currentTarget.style.backgroundColor =
                      notificacion.estado === "cerrado" ? "#bbdefb" : "#f9f9f9";
                  }
                }}
                onClick={() => handleClickNotificacion(notificacion.link)} // Redirigir al hacer clic
              >
                <div
                  style={{ fontWeight: "500", color: "#333" }}
                  dangerouslySetInnerHTML={{
                    __html: obtenerMensajeNotificacion(notificacion),
                  }}
                />
                <small style={{ color: "#666", fontSize: "12px" }}>
                  {new Date(notificacion.fechaNotificacion).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificacionesCampana;