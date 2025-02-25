import React, { useState, useEffect } from "react";

const NotificacionesCampana = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNotificaciones, setTotalNotificaciones] = useState(0);
  const [mostrarLista, setMostrarLista] = useState(false);
  const idRol = localStorage.getItem("idRol");

  // Si el idRol no es 2, no renderizar el componente
  if (idRol !== "2") {
    return null;
  }

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch("/api/convocatorias/notificaciones/select");
      const data = await response.json();
      setNotificaciones(data.notificaciones);
      setTotalNotificaciones(data.totalNotificaciones);
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
    fetchNotificaciones();
  }, []);

  const toggleLista = () => {
    if (mostrarLista && totalNotificaciones > 0) {
      // Obtener los IDs de las notificaciones nuevas
      const idsNotificaciones = notificaciones
        .filter((notificacion) => notificacion.estado === "cerrado")
        .map((notificacion) => notificacion.idNotificacion);

      // Actualizar el estado de las notificaciones a "leído"
      actualizarNotificaciones(idsNotificaciones);

      // Actualizar el estado local para reflejar que las notificaciones han sido leídas
      setTotalNotificaciones(0);
    }
    setMostrarLista((prev) => !prev);
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
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    notificacion.estado === "cerrado" ? "#bbdefb" : "#f9f9f9";
                }}
              >
                <div style={{ fontWeight: "500", color: "#333" }}>
                  <strong>{notificacion.docente}</strong> se ha postulado a{" "}
                  <strong>{notificacion.convocatoria}</strong>.
                </div>
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