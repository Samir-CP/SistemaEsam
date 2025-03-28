// src/pages/api/docentes/gestion-areas.ts
import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface GestionAreasRequest {
  idDocente: number;
  areasAAñadir?: number[];
  sectoresAAñadir?: number[];
  areasAEliminar?: number[];
  sectoresAEliminar?: number[];
}

interface AreaRow extends RowDataPacket {
  idArea: number;
}

interface SectorRow extends RowDataPacket {
  idSector: number;
}

export async function POST({ request }: APIContext) {
  let db;
  try {
    const requestData: GestionAreasRequest = await request.json();
    const { 
      idDocente, 
      areasAAñadir = [], 
      sectoresAAñadir = [], 
      areasAEliminar = [], 
      sectoresAEliminar = [] 
    } = requestData;

    if (!idDocente) {
      return new Response(
        JSON.stringify({ error: "ID de docente requerido" }),
        { status: 400 }
      );
    }

    db = await connectToDatabase();
    await db.execute("START TRANSACTION");

    try {
      // Eliminar áreas
      if (areasAEliminar.length > 0) {
        await db.query<ResultSetHeader>(
          `DELETE FROM areas_docentes WHERE idDocente = ? AND idArea IN (?)`,
          [idDocente, areasAEliminar]
        );
      }

      // Eliminar sectores
      if (sectoresAEliminar.length > 0) {
        await db.query<ResultSetHeader>(
          `DELETE FROM sectores_docentes WHERE idDocente = ? AND idSector IN (?)`,
          [idDocente, sectoresAEliminar]
        );
      }

      // Añadir nuevas áreas
      if (areasAAñadir.length > 0) {
        const areaValues = areasAAñadir.map((idArea: number) => [idDocente, idArea]);
        await db.query<ResultSetHeader>(
          `INSERT IGNORE INTO areas_docentes (idDocente, idArea) VALUES ?`,
          [areaValues]
        );
      }

      // Añadir nuevos sectores
      if (sectoresAAñadir.length > 0) {
        const sectorValues = sectoresAAñadir.map((idSector: number) => [idDocente, idSector]);
        await db.query<ResultSetHeader>(
          `INSERT IGNORE INTO sectores_docentes (idDocente, idSector) VALUES ?`,
          [sectorValues]
        );
      }

      await db.execute("COMMIT");

      // Obtener áreas actualizadas
      const [areasActualizadas] = await db.query<AreaRow[]>(
        `SELECT idArea FROM areas_docentes WHERE idDocente = ?`,
        [idDocente]
      );
      
      // Obtener sectores actualizados
      const [sectoresActualizados] = await db.query<SectorRow[]>(
        `SELECT idSector FROM sectores_docentes WHERE idDocente = ?`,
        [idDocente]
      );

      return new Response(
        JSON.stringify({ 
          success: true,
          areasActualizadas: areasActualizadas.map(a => a.idArea),
          sectoresActualizados: sectoresActualizados.map(s => s.idSector),
          areasAAñadidas: areasAAñadir.length,
          sectoresAAñadidos: sectoresAAñadir.length,
          areasEliminadas: areasAEliminar.length,
          sectoresEliminados: sectoresAEliminar.length
        }),
        { status: 200 }
      );

    } catch (error) {
      await db.execute("ROLLBACK");
      throw error;
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido"
      }),
      { status: 500 }
    );
  } finally {
    if (db) await db.end().catch(console.error);
  }
}