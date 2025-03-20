// src/pages/api/metricas/editar.ts
import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";

export async function PUT({ request, params }: APIContext) {
  let db: any;

  try {
    // Conectar a la base de datos
    db = await connectToDatabase();
    const body = await request.json();

    const { idDocente, observaciones, recomendaciones, criterios } = body;

    // 1. Actualizar la tabla `metricas`
    const queryMetrica = `
      UPDATE metricas
      SET observaciones = ?, recomendaciones = ?, fecha = NOW()
      WHERE idDocente = ?
    `;
    const valuesMetrica = [
      observaciones || null, // Si observaciones es undefined, se pasa null
      recomendaciones || null, // Si recomendaciones es undefined, se pasa null
      idDocente,
    ];

    await db.execute(queryMetrica, valuesMetrica);

    // 2. Obtener el ID de la métrica asociada al docente
    const queryGetMetricaId = `
      SELECT idMetricas FROM metricas WHERE idDocente = ?
    `;
    const [resultMetrica] = await db.execute(queryGetMetricaId, [idDocente]);

    if (resultMetrica.length === 0) {
      return new Response(
        JSON.stringify({ error: "No se encontraron métricas para el docente" }),
        { status: 404 }
      );
    }

    const idMetrica = resultMetrica[0].idMetricas;

    // 3. Actualizar solo los criterios que han cambiado
    for (const criterio of criterios) {
      const queryUpdateCriterio = `
        UPDATE metricas_criteriosevaluacion
        SET cotejo = ?
        WHERE idMetrica = ? AND idCriterio = ?
      `;
      const valuesUpdateCriterio = [
        criterio.cotejo || null, // Si cotejo es undefined, se pasa null
        idMetrica,
        criterio.idCriterio,
      ];

      await db.execute(queryUpdateCriterio, valuesUpdateCriterio);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Métricas actualizadas correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar las métricas:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar las métricas" }),
      { status: 500 }
    );
  } finally {
    if (db) db.end(); // Cerrar la conexión a la base de datos
  }
}