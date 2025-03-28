import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  try {
    const { searchParams } = new URL(request.url);
    const idDocente = searchParams.get('idDocente');
    
    if (!idDocente) {
      return new Response(
        JSON.stringify({ error: "ID de docente no proporcionado" }),
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Consulta para obtener las áreas del docente
    const [areasDocente]: any = await db.query(`
      SELECT a.idArea, a.nombre as nombreArea
      FROM areas_docentes ad
      JOIN areas a ON ad.idArea = a.idArea
      WHERE ad.idDocente = ?
    `, [idDocente]);

    // Consulta para obtener los sectores del docente
    const [sectoresDocente]: any = await db.query(`
      SELECT s.idSector, s.nombre as nombreSector
      FROM sectores_docentes sd
      JOIN sectores s ON sd.idSector = s.idSector
      WHERE sd.idDocente = ?
    `, [idDocente]);

    return new Response(
      JSON.stringify({
        areas: areasDocente,
        sectores: sectoresDocente
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener áreas y sectores" }),
      { status: 500 }
    );
  }
}