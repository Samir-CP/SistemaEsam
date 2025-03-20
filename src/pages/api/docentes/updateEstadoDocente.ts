import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";

export async function PUT({ request }: APIContext) {
  let db: any;

  try {
    // Obtener los datos del cuerpo de la solicitud
    const body = await request.json();
    const { idDocente, estado } = body;

    // Validar que se reciban los campos necesarios
    if (!idDocente || !estado || !["aprobado", "rechazado", "postulante"].includes(estado)) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios o el estado es inválido" }),
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    db = await connectToDatabase();

    // Actualizar el estado del docente
    const queryUpdateDocente = `
      UPDATE docentes
      SET estado = ?
      WHERE idDocente = ?
    `;
    const valuesUpdateDocente = [estado, idDocente];

    // Ejecutar la consulta de actualización del docente
    const [resultUpdateDocente]: any = await db.execute(queryUpdateDocente, valuesUpdateDocente);

    // Verificar si la actualización fue exitosa
    if (resultUpdateDocente.affectedRows === 0) {
      return new Response(
        JSON.stringify({
          error: "No se encontró el docente o no se actualizó el estado",
        }),
        { status: 404 }
      );
    }

    // Insertar una notificación en la tabla notificaciones
    const queryInsertNotificacion = `
      INSERT INTO notificaciones (idDocente, idConvocatoria, idTipoNotificaciones, fechaNotificacion, estado)
      VALUES (?, NULL, 2, NOW(), 'cerrado')
    `;
    const valuesInsertNotificacion = [idDocente];

    await db.execute(queryInsertNotificacion, valuesInsertNotificacion);

    return new Response(
      JSON.stringify({
        message: `Estado del docente actualizado a ${estado} y notificación creada`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar el estado del docente o crear la notificación:", error);
    return new Response(
      JSON.stringify({
        error: "Error al actualizar el estado del docente o crear la notificación",
      }),
      { status: 500 }
    );
  } finally {
    if (db) db.end();
  }
}