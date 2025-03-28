// src/pages/api/docentes/insertar-areas.ts
import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'tu_clave_secreta'; // Asegúrate que coincida con tu otro JWT_SECRET

export async function POST({ request }: APIContext) {
  let db;
  try {
    const { idDocente, idAreasInteres, idSectores } = await request.json();

    // Validaciones básicas
    if (!idDocente || !Array.isArray(idAreasInteres) || !Array.isArray(idSectores)) {
      return new Response(
        JSON.stringify({ error: "Datos de entrada inválidos" }),
        { status: 400 }
      );
    }

    db = await connectToDatabase();

    // Verificar si el docente existe y obtener sus datos
    const [docenteRows] = await db.execute<RowDataPacket[]>(
      "SELECT nombres, apellidoPaterno, idRol FROM docentes WHERE idDocente = ?",
      [idDocente]
    );

    if (docenteRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "El docente no existe en el sistema" }),
        { status: 404 }
      );
    }

    const docente = docenteRows[0];

    // Iniciar transacción
    await db.execute("START TRANSACTION");

    try {
      // 1. Insertar áreas de interés
      if (idAreasInteres.length > 0) {
        const areaValues = idAreasInteres.map((idArea) => [idDocente, idArea]);
        await db.query<ResultSetHeader>(
          "INSERT INTO areas_docentes (idDocente, idArea) VALUES ?",
          [areaValues]
        );
      }

      // 2. Insertar sectores de interés
      if (idSectores.length > 0) {
        const sectorValues = idSectores.map((idSector) => [idDocente, idSector]);
        await db.query<ResultSetHeader>(
          "INSERT INTO sectores_docentes (idDocente, idSector) VALUES ?",
          [sectorValues]
        );
      }

      await db.execute("COMMIT");

      // 4. Generar nuevo token JWT con el primer área seleccionada
      const newToken = jwt.sign(
        { 
          idDocente: idDocente,
          nombre: docente.nombres.trim(),
          apellidoPaterno: docente.apellidoPaterno.trim(),
          idRol: docente.idRol,
          idArea: idAreasInteres[0] // Tomamos el primer área seleccionada
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Preferencias registradas exitosamente",
          token: newToken, // Enviamos el nuevo token
          areas: idAreasInteres.length,
          sectores: idSectores.length
        }),
        { status: 200 }
      );
    } catch (error) {
      await db.execute("ROLLBACK");
      throw error;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error al registrar preferencias",
        details: errorMessage 
      }),
      { status: 500 }
    );
  } finally {
    if (db) {
      await db.end().catch(err => console.error("Error al cerrar conexión:", err));
    }
  }
}