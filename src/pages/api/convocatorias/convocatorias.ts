import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  try {
    const db = await connectToDatabase();
    const url = new URL(request.url);

    // Consulta SQL principal con filtros dinámicos
    const query = `
      SELECT 
        c.idConvocatoria, 
        c.titulo, 
        c.perfil, 
        c.link,
        c.requisitos, 
        c.fechaInicio, 
        c.fechaFinal, 
        c.estado, 
        c.imagenPortada,
        c.formularioExterno,
        a.idArea AS idAreaInteres,
        a.nombre AS area,
        s.idSector AS idSector,
        s.nombre AS sector,
        COALESCE(
          CASE
            WHEN COUNT(d.idDocente) > 0 THEN
              CONCAT(
                '[', 
                GROUP_CONCAT(
                  DISTINCT CONCAT(
                    '{',
                      '"idDocente":"', IFNULL(d.idDocente, ''), '", ',
                      '"nombre":"', IFNULL(d.nombres, ''), '", ',
                      '"apellidoPaterno":"', IFNULL(d.apellidoPaterno, ''), '", ',
                      '"apellidoMaterno":"', IFNULL(d.apellidoMaterno, ''), '", ',
                      '"fechaPostulacion":"', IFNULL(DATE_FORMAT(pc.fechaPostulacion, '%Y-%m-%d %H:%i:%s'), ''), '"',
                    '}'
                  ) SEPARATOR ','
                ), 
                ']'
              )
            ELSE '[]'
          END,
          '[]'
        ) AS postulantes,
        COUNT(d.idDocente) AS totalPostulantes
      FROM convocatorias c
      LEFT JOIN postulantes_convocatoria pc ON c.idConvocatoria = pc.idConvocatoria
      LEFT JOIN docentes d ON pc.idDocente = d.idDocente
      LEFT JOIN areas a ON a.idArea = c.idArea
      LEFT JOIN sectores s ON s.idSector = c.idSector
      WHERE c.estado = "abierta" OR c.estado="cerrada"
      GROUP BY c.idConvocatoria;
    `;

    const [results] = await db.query(query) as [any[], any];
    db.end();

    // Procesamos cada fila para convertir el campo de GROUP_CONCAT a un array
    const parsedResults = results.map((row) => {
      try {
        row.postulantes = JSON.parse(row.postulantes);
      } catch (e) {
        row.postulantes = [];
      }
      return row;
    });

    return new Response(JSON.stringify(parsedResults), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener las convocatorias:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener las convocatorias" }),
      { status: 500 }
    );
  }
}