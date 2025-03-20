import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";

export async function PUT({ request }: APIContext) {
  try {
    // Leer el cuerpo del request como JSON
    const body = await request.json();
    const { idsNotificaciones } = body;

    // Validar los datos recibidos
    if (!idsNotificaciones || !Array.isArray(idsNotificaciones)) {
      return new Response(
        JSON.stringify({ error: "Faltan datos obligatorios" }),
        { status: 400 }
      );
    }

    // Si no hay IDs, no hay nada que actualizar
    if (idsNotificaciones.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No hay notificaciones para actualizar",
        }),
        { status: 200 }
      );
    }

    // Conectar a la base de datos
    const db = await connectToDatabase();

    // Convertir el array de IDs a una cadena separada por comas
    const idsString = idsNotificaciones.join(",");

    // Consulta para actualizar el estado de las notificaciones
    const query = `UPDATE notificaciones SET estado = 'leido' WHERE idNotificacion IN (${idsString})`;

    // Ejecutar la consulta
    const [result]: any = await db.execute(query);

    db.end();

    // Verificar si se afectó alguna fila
    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({
          error: "No se encontraron notificaciones o no se actualizaron",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Estado de las notificaciones actualizado correctamente",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    return new Response(
      JSON.stringify({
        error: "Error al actualizar el estado",
      }),
      { status: 500 }
    );
  }
}