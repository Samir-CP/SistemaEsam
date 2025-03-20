// src/pages/api/metricas/guardar.ts
import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";

export async function POST({ request }: APIContext) {
  let db: any;

  try {
    // Conectar a la base de datos
    db = await connectToDatabase();
    const body = await request.json();

    const { idDocente, observaciones, recomendaciones, criterios } = body;

    // Insertar en la tabla `metricas`
    const queryMetrica = `
      INSERT INTO metricas (idDocente, fecha, observaciones, recomendaciones)
      VALUES (?, NOW(), ?, ?)
    `;
    const valuesMetrica = [idDocente, observaciones, recomendaciones];

    const [resultMetrica] = await db.execute(queryMetrica, valuesMetrica);

    // Obtener el ID de la métrica insertada
    const idMetrica = resultMetrica.insertId; // Aquí está el cambio importante

    // Insertar en la tabla `metricas_criteriosevaluacion`
    for (const criterio of criterios) {
      const queryCriterio = `
        INSERT INTO metricas_criteriosevaluacion (idMetrica, idCriterio, cotejo)
        VALUES (?, ?, ?)
      `;
      const valuesCriterio = [idMetrica, criterio.idCriterio, criterio.cotejo];

      await db.execute(queryCriterio, valuesCriterio);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Métricas guardadas correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al guardar las métricas:", error);
    return new Response(
      JSON.stringify({ error: "Error al guardar las métricas" }),
      { status: 500 }
    );
  } finally {
    if (db) db.end(); // Cerrar la conexión a la base de datos
  }
}