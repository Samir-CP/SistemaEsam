import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";

// Función para manejar valores nulos y undefined
const sanitizeValue = (value: any) => (value === undefined ? null : value);

export async function POST({ request }: APIContext) {
  try {
    const data = await request.json();
    console.log("Datos recibidos para creación:", data);

    const { idDocente, produccionesIntelectuales } = data;

    if (!idDocente || !produccionesIntelectuales || produccionesIntelectuales.length === 0) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios o producciones intelectuales" }),
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Verificar si el docente existe
    const [docenteResult]: any = await db.execute(
      `SELECT COUNT(*) AS count FROM docentes WHERE idDocente = ?`,
      [idDocente]
    );
    if (docenteResult[0].count === 0) {
      return new Response(JSON.stringify({ error: "Docente no encontrado" }), { status: 404 });
    }

    for (const produccion of produccionesIntelectuales) {
      const { nombre, enlaceEditorial, idTipoPublicacion, idPais, fecha } = produccion;

      // Crear nueva producción intelectual
      const insertProduccionQuery = `
        INSERT INTO produccionesintelectuales (nombre, enlaceEditorial, idTipoPublicacion, idPais, fecha)
        VALUES (?, ?, ?, ?, ?)
      `;
      const insertProduccionValues = [
        sanitizeValue(nombre?.trim()),
        sanitizeValue(enlaceEditorial?.trim()),
        sanitizeValue(idTipoPublicacion),
        sanitizeValue(idPais),
        sanitizeValue(fecha?.trim()),
      ];

      console.log("Insertando producción intelectual con valores:", insertProduccionValues);
      const [produccionResult]: any = await db.execute(
        insertProduccionQuery,
        insertProduccionValues
      );

      // Crear relación con el docente
      const insertRelacionQuery = `
        INSERT INTO docentes_publicacionesintelectuales (idDocente, idProduccionIntelectual)
        VALUES (?, ?)
      `;
      const insertRelacionValues = [idDocente, produccionResult.insertId];

      console.log(
        "Insertando relación docente-producción con valores:",
        insertRelacionValues
      );
      await db.execute(insertRelacionQuery, insertRelacionValues);
    }

    db.end();

    return new Response(
      JSON.stringify({ message: "Producciones intelectuales creadas correctamente" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en el servidor:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear producciones intelectuales" }),
      { status: 500 }
    );
  }
}
