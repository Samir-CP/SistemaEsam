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
    const formData = await request.formData();

    // Extraer los datos del formulario
    const idArchivo = formData.get("idArchivo")?.toString();
    const docente_id = formData.get("docente_id")?.toString();
    const docente_name = formData.get("docente_name")?.toString();
    const archivo = formData.get("archivo") as File | null;
    const tipoArchivoId = formData.get("idtipo_archivo")?.toString();

    // Validar los campos requeridos
    if (!idArchivo || !docente_id || !docente_name || !tipoArchivoId) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    const db = await connectToDatabase();
    
    // Obtener el archivo actual con tipado correcto
    const [rows] = await db.execute<FileRecord[]>(
      "SELECT ruta_archivo FROM archivos_docentes WHERE id_ad = ?",
      [idArchivo]
    );

    const currentFile = rows[0];
    let archivoPath = null;
    
    if (archivo) {
      // Validar el tamaño del archivo (límite: 2 MB)
      const fileSizeLimit = 2 * 1024 * 1024; 
      if (archivo.size > fileSizeLimit) {
        await db.end();
        return new Response(
          JSON.stringify({ error: "El archivo supera el límite de 2 MB" }),
          { status: 400 }
        );
      }

      // Eliminar el archivo anterior si existe
      if (currentFile?.ruta_archivo) {
        try {
          const oldFilePath = path.join(process.cwd(), "public", currentFile.ruta_archivo);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (err) {
          console.error("Error al eliminar el archivo anterior:", err);
        }
      }

      // Guardar el nuevo archivo
      const uploadDir = path.join(
        process.cwd(),
        "public/subidasDocente",
        `${docente_name}_${docente_id}`
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${archivo.name || "archivo"}`;
      const filePath = path.join(uploadDir, fileName);

      try {
        const buffer = Buffer.from(await archivo.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        archivoPath = `/subidasDocente/${docente_name}_${docente_id}/${fileName}`;
      } catch (err) {
        await db.end();
        console.error("Error al guardar el archivo:", err);
        return new Response(
          JSON.stringify({ error: "Error al guardar el archivo" }),
          { status: 500 }
        );
      }
    }

    // Actualizar el registro en la base de datos
    const query = `
      UPDATE archivos_docentes 
      SET 
        nombre_archivo = ?, 
        ruta_archivo = COALESCE(?, ruta_archivo), 
        idTipo_archivo = ?,
        createdAt = CURRENT_TIMESTAMP
      WHERE id_ad = ?
    `;
    const values = [
      archivo?.name.trim(),
      archivoPath,
      Number(tipoArchivoId),
      Number(idArchivo)
    ];

    // Para consultas UPDATE usamos execute<ResultSetHeader>
    const [result] = await db.execute<ResultSetHeader>(query, values);
    
    if (result.affectedRows === 0) {
      await db.end();
      return new Response(
        JSON.stringify({ error: "No se encontró el archivo a actualizar" }),
        { status: 404 }
      );
    }

    await db.end();

    return new Response(
      JSON.stringify({ message: "Archivo actualizado correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el archivo" }),
      { status: 500 }
    );
  }
}