import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET({ params }: APIContext) {
  const { titulo } = params;  // Ahora estamos extrayendo el 'titulo' como parámetro

  if (!titulo) {
    return new Response(JSON.stringify({ error: "Falta el parámetro titulo" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = await connectToDatabase();

    // Usamos el título en la consulta SQL
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
      WHERE c.titulo = ?  
      GROUP BY c.idConvocatoria;
    `;

    // Ejecutar la consulta con el título
    const [rows]: any[] = await db.query(query, [titulo]);
    db.end();

    // Verificar si hay resultados
    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "No se encontró la convocatoria especificada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
 // Procesamos cada fila para convertir el campo de GROUP_CONCAT a un array
 const parsedResults = rows.map((row) => {
  try {
    row.postulantes = JSON.parse(row.postulantes);
  } catch (e) {
    row.postulantes = [];
  }
  return row;
});
    return new Response(JSON.stringify(parsedResults[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener la convocatoria:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener la convocatoria" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

