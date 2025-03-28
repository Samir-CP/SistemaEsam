import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";
import fs from "fs";
import path from "path";

export async function POST({ request }: APIContext) {
  try {
    const formData = await request.formData();

    // Extraer los datos del formulario
    const docente_id = formData.get("docente_id")?.toString();
    const docente_name = formData.get("docente_name")?.toString();
    const archivo = formData.get("archivo") as File | null;
    const tipoArchivoId = formData.get("idtipo_archivo")?.toString();

    // Validar los campos requeridos
    if (!docente_id || !docente_name || !archivo || !tipoArchivoId) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400 }
      );
    }

    // Validar el tamaño del archivo (límite: 2 MB)
    const fileSizeLimit = 2 * 1024 * 1024; 
    if (archivo.size > fileSizeLimit) {
      return new Response(
        JSON.stringify({ error: "El archivo supera el límite de 2 MB" }),
        { status: 400 }
      );
    }

    // Guardar el archivo en el servidor
    let archivoPath = null;
    if (archivo) {
      const date = new Date().toISOString().split("T")[0];
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
        // Leer el archivo y guardarlo en el servidor
        const buffer = Buffer.from(await archivo.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        archivoPath = `/subidasDocente/${docente_name}_${docente_id}/${fileName}`;
      } catch (err) {
        console.error("Error al guardar el archivo:", err);
        return new Response(
          JSON.stringify({ error: "Error al guardar el archivo" }),
          { status: 500 }
        );
      }
    }

    // Conectar a la base de datos e insertar los datos
    const db = await connectToDatabase();

    const query = `
      INSERT INTO archivos_docentes (
        idDocente, nombre_archivo, ruta_archivo, idTipo_archivo
      ) VALUES (?, ?, ?, ?)
    `;
    const values = [
      Number(docente_id),
      archivo?.name.trim(),
      archivoPath || null,
      Number(tipoArchivoId),
    ];

    await db.execute(query, values);
    db.end();

    return new Response(
      JSON.stringify({ message: "Archivo subido correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error al insertar datos" }),
      { status: 500 }
    );
  }
}
