// src/pages/api/delete_archivo.ts
import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";
import fs from "fs";
import path from "path";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

interface FileRecord extends RowDataPacket {
  ruta_archivo: string;
}

export async function POST({ request }: APIContext) {
  try {
    const { idArchivo } = await request.json();

    if (!idArchivo) {
      return new Response(
        JSON.stringify({ error: "ID de archivo no proporcionado" }),
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // 1. Obtener información del archivo para borrar el archivo físico
    const [rows] = await db.execute<FileRecord[]>(
      "SELECT ruta_archivo FROM archivos_docentes WHERE id_ad = ?",
      [idArchivo]
    );

    const fileToDelete = rows[0];

    // 2. Eliminar el archivo físico si existe
    if (fileToDelete?.ruta_archivo) {
      try {
        const filePath = path.join(process.cwd(), "public", fileToDelete.ruta_archivo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error("Error al eliminar el archivo físico:", err);
      }
    }

    // 3. Eliminar el registro de la base de datos
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM archivos_docentes WHERE id_ad = ?",
      [idArchivo]
    );

    await db.end();

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ error: "No se encontró el archivo a eliminar" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Archivo eliminado correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error al eliminar el archivo" }),
      { status: 500 }
    );
  }
}