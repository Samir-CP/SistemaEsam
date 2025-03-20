// src/pages/api/criterios.ts
import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  try {
    const db = await connectToDatabase();

    // Consulta SQL para obtener los criterios de evaluación
    const query = `
      SELECT id_criterio, criterio
      FROM criterios_evaluacion;
    `;

    const [results] = await db.query(query) as [any[], any];
    db.end();

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener los criterios de evaluación:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener los criterios de evaluación" }),
      { status: 500 }
    );
  }
}