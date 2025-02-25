import { connectToDatabase } from "../../utils/dbConect";
import type { APIContext } from "astro";

// Función para manejar valores nulos y undefined
const sanitizeValue = (value: any) => (value === undefined ? null : value);

export async function POST({ request }: APIContext) {
  try {
    const data = await request.json();
    console.log("Datos recibidos en el servidor:", data);

    const { idDocente, estudiossuperiores } = data;

    if (!idDocente || !estudiossuperiores || estudiossuperiores.length === 0) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios o estudios superiores" }),
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

    for (const estudio of estudiossuperiores) {
      // Validar idTipoEstudio
      const [tipoEstudioResult]: any = await db.execute(
        `SELECT COUNT(*) AS count FROM tiposestudios WHERE idTipoEstudio = ?`,
        [estudio.idTipo]
      );
      if (tipoEstudioResult[0].count === 0) {
        return new Response(JSON.stringify({ error: "idTipo no válido" }), { status: 400 });
      }

      // Insertar estudio superior
      const estudioQuery = `
        INSERT INTO estudiossuperiores (universidad, carrera, fecha, nombre, idPais, idGrado, idModalidad, idTipoEstudio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const estudioValues = [
        sanitizeValue(estudio.universidad?.trim()),
        sanitizeValue(estudio.carrera?.trim()),
        sanitizeValue(estudio.fecha?.trim()),
        sanitizeValue(estudio.nombre?.trim()),
        sanitizeValue(Number(estudio.idPais)),
        sanitizeValue(Number(estudio.idGrado)),
        sanitizeValue(Number(estudio.idModalidad)),
        sanitizeValue(Number(estudio.idTipo)),
      ];

      console.log("Ejecutando inserción con valores:", estudioValues);
      const [estudioResult]: any = await db.execute(estudioQuery, estudioValues);

      // Insertar relación en docentes_estudios
      const docentesEstudiosQuery = `
        INSERT INTO docentes_estudios (idDocente, idEstudioSuperior)
        VALUES (?, ?)
      `;
      const docentesEstudiosValues = [
        sanitizeValue(Number(idDocente)),
        estudioResult.insertId,
      ];
      await db.execute(docentesEstudiosQuery, docentesEstudiosValues);
    }

    db.end();

    return new Response(
      JSON.stringify({ message: "Estudios superiores insertados correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en el servidor:", error);
    return new Response(
      JSON.stringify({ error: "Error al insertar estudios superiores" }),
      { status: 500 }
    );
  }
}