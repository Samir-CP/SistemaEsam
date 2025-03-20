import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  let db: any;

  try {
    // Conectar a la base de datos
    db = await connectToDatabase();

    // Obtener el idDocente y idRol desde el query parameter
    const url = new URL(request.url);
    const idDocente = url.searchParams.get("idDocente");
    const idRol = url.searchParams.get("idRol");

    if (!idRol) {
      return new Response(
        JSON.stringify({ error: "idRol no proporcionado" }),
        { status: 400 }
      );
    }

    let queryNotificaciones: string;
    let queryCount: string;
    let params: any[] = [];

    if (idRol === "2") {
      // Consulta para académicos: Mostrar todas las notificaciones de tipo "postulacion"
      queryNotificaciones = `
        SELECT 
          n.idNotificacion, 
          d.nombres AS docente, 
          c.titulo AS convocatoria, 
          c.link AS link,
          tn.descripcion AS tipo, 
          n.fechaNotificacion,
          n.estado
        FROM notificaciones n
        LEFT JOIN docentes d ON n.idDocente = d.idDocente
        LEFT JOIN convocatorias c ON n.idConvocatoria = c.idConvocatoria
        LEFT JOIN tipo_notificaciones tn ON n.idTipoNotificaciones = tn.idTipoNotificaciones
        WHERE tn.descripcion = 'postulacion' -- Solo notificaciones de postulación
        ORDER BY n.fechaNotificacion DESC
      `;

      queryCount = `
        SELECT COUNT(*) AS total
        FROM notificaciones n
        JOIN tipo_notificaciones tn ON n.idTipoNotificaciones = tn.idTipoNotificaciones
        WHERE n.estado = 'cerrado'
        AND tn.descripcion = 'postulacion' -- Solo notificaciones de postulación
      `;
    } else if (idRol === "4" && idDocente) {
      // Consulta para docentes: Mostrar solo las notificaciones del docente actual
      queryNotificaciones = `
        SELECT 
          n.idNotificacion, 
          d.nombres AS docente, 
          c.titulo AS convocatoria, 
          c.link AS link,
          tn.descripcion AS tipo, 
          n.fechaNotificacion,
          n.estado
        FROM notificaciones n
        LEFT JOIN docentes d ON n.idDocente = d.idDocente
        LEFT JOIN convocatorias c ON n.idConvocatoria = c.idConvocatoria
        LEFT JOIN tipo_notificaciones tn ON n.idTipoNotificaciones = tn.idTipoNotificaciones
        WHERE n.idDocente = ? 
        AND tn.descripcion = 'aprobado'-- Filtrar por el idDocente actual
        ORDER BY n.fechaNotificacion DESC
      `;

      queryCount = `
        SELECT COUNT(*) AS total
        FROM notificaciones n
        JOIN tipo_notificaciones tn ON n.idTipoNotificaciones = tn.idTipoNotificaciones
        WHERE n.estado = 'cerrado'
        AND n.idDocente = ? -- Filtrar por el idDocente actual
        AND tn.descripcion IN ('aprobado') -- Filtra por tipos de notificación
      `;

      params = [idDocente];
    } else {
      return new Response(
        JSON.stringify({ error: "Parámetros inválidos" }),
        { status: 400 }
      );
    }

    // Ejecutar la consulta de notificaciones
    const [notificaciones] = await db.execute(queryNotificaciones, params);

    // Ejecutar la consulta de conteo
    const [countResult] = await db.execute(queryCount, params);
    const totalNotificaciones = countResult[0].total;

    return new Response(
      JSON.stringify({ notificaciones, totalNotificaciones }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener las notificaciones:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener las notificaciones" }),
      { status: 500 }
    );
  } finally {
    if (db) db.end();
  }
}