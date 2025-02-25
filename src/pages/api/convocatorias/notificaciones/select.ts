import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  let db: any;

  try {
    // Conectar a la base de datos
    db = await connectToDatabase();

    // Obtener todas las notificaciones (nuevas y leídas)
    const queryNotificaciones = `
      SELECT 
        n.idNotificacion, 
        d.nombres AS docente, 
        c.titulo AS convocatoria, 
        tn.descripcion AS tipo, 
        n.fechaNotificacion,
        n.estado
      FROM notificaciones n
      JOIN docentes d ON n.idDocente = d.idDocente
      JOIN convocatorias c ON n.idConvocatoria = c.idConvocatoria
      JOIN tipo_notificaciones tn ON n.idTipoNotificaciones = tn.idTipoNotificaciones
      ORDER BY n.fechaNotificacion DESC
    `;

    const [notificaciones] = await db.execute(queryNotificaciones);

    // Obtener el conteo de notificaciones nuevas (estado "cerrado")
    const queryCount = `
      SELECT COUNT(*) AS total
      FROM notificaciones
      WHERE estado = 'cerrado'
    `;

    const [countResult] = await db.execute(queryCount);
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