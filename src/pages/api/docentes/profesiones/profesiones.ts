import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET(_: APIContext) {
  try {
    const db = await connectToDatabase();

    const query = `
   SELECT idProfesion, nombreProfesion FROM profesiones;
    `;

    const [results] = await db.query(query);

    db.end();

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.error("Error al obtener los paises:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener los paises" }),
      { status: 500 }
    );
  }
}
