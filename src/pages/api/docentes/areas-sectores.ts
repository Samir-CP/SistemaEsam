import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET(_: APIContext) {
  try {
    const db = await connectToDatabase();

    // Consulta para obtener las áreas
    const queryAreas = `
      SELECT idArea as id, nombre as categoria
      FROM areas
    `;

    // Consulta para obtener los sectores
    const querySectores = `
      SELECT idSector as id, nombre as sector
      FROM sectores
    `;

    // Ejecutar ambas consultas
    const [areas] = await db.query(queryAreas);
    const [sectores] = await db.query(querySectores);

    db.end();

    // Retornar los resultados en formato JSON
    return new Response(
      JSON.stringify({ areas, sectores }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener áreas y sectores:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener áreas y sectores" }),
      { status: 500 }
    );
  }
}