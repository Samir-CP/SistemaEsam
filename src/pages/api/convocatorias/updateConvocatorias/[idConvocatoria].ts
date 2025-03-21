import { connectToDatabase } from "../../../../utils/dbConect";
import type { APIContext } from "astro";
import * as fs from 'fs';
import * as path from 'path';

const sanitizeValue = (value: any) => (value === undefined ? null : value);

export async function PUT({ request, params }: APIContext) {
  let db: any;

  try {
    // Obtener el ID de la convocatoria desde los parámetros de la ruta
    const { idConvocatoria } = params;

    if (!idConvocatoria) {
      return new Response(
        JSON.stringify({ error: "Falta el ID de la convocatoria" }),
        { status: 400 }
      );
    }

    // Obtener los datos del cuerpo de la solicitud como FormData
    const formData = await request.formData();

    // Extraer los valores del FormData
    const titulo = formData.get("titulo") as string;
    const perfil = formData.get("perfil") as string;
    const fechaInicio = formData.get("fechaInicio") as string;
    const fechaFinal = formData.get("fechaFinal") as string;
    const requisitos = formData.get("requisitos") as string;
    const idAreaInteres = formData.get("idAreaInteres") as string;
    const idSector = formData.get("idSector") as string;
    const formularioExterno = formData.get("formularioExterno") as string;
    const imagenPortada = formData.get("imagenPortada") as File | null;

    // Conectar a la base de datos
    db = await connectToDatabase();

    // Obtener la convocatoria actual para comparar los valores
    const [currentConvocatoria]: any = await db.execute(
      "SELECT * FROM convocatorias WHERE idConvocatoria = ?",
      [idConvocatoria]
    );

    if (currentConvocatoria.length === 0) {
      return new Response(
        JSON.stringify({ error: "Convocatoria no encontrada" }),
        { status: 404 }
      );
    }

    const currentData = currentConvocatoria[0];

    // Crear un objeto con los nuevos valores, solo si son diferentes a los actuales
    const updates: { [key: string]: any } = {};

    if (titulo && titulo.trim() !== currentData.titulo) updates.titulo = titulo.trim();
    if (perfil && perfil.trim() !== currentData.perfil) updates.perfil = perfil.trim();
    if (fechaInicio && new Date(fechaInicio).toISOString().split("T")[0] !== currentData.fechaInicio) updates.fechaInicio = new Date(fechaInicio).toISOString().split("T")[0];
    if (fechaFinal && new Date(fechaFinal).toISOString().split("T")[0] !== currentData.fechaFinal) updates.fechaFinal = new Date(fechaFinal).toISOString().split("T")[0];
    if (requisitos && requisitos.trim() !== currentData.requisitos) updates.requisitos = requisitos.trim();
    if (idAreaInteres && idAreaInteres !== currentData.idArea) updates.idArea = idAreaInteres;
    if (idSector && idSector !== currentData.idSector) updates.idSector = idSector;
    if (formularioExterno && formularioExterno !== currentData.formularioExterno) updates.formularioExterno = formularioExterno;

    // Generar el link basado en el título si este ha cambiado
    if (updates.titulo) {
      updates.link = `http://localhost:4321/convocatorias/${encodeURIComponent(updates.titulo)}`;
    }

    // Procesar la imagen de portada si se proporciona una nueva
    if (imagenPortada && imagenPortada.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'convocatorias');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Eliminar la imagen anterior si existe
      if (currentData.imagenPortada) {
        const oldImagePath = path.join(process.cwd(), 'public', currentData.imagenPortada);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Guardar la nueva imagen
      const fileName = `${Date.now()}-${imagenPortada.name}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await imagenPortada.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      updates.imagenPortada = `/images/convocatorias/${fileName}`;
    }

    // Si hay campos para actualizar, construir y ejecutar la consulta SQL
    if (Object.keys(updates).length > 0) {
      const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
      const updateValues = Object.values(updates);
      updateValues.push(idConvocatoria);

      const updateQuery = `
        UPDATE convocatorias
        SET ${updateFields}
        WHERE idConvocatoria = ?;
      `;

      await db.execute(updateQuery, updateValues);
    }

    // Retornar una respuesta exitosa
    return new Response(
      JSON.stringify({ message: "Convocatoria actualizada correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en el servidor:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar convocatoria" }),
      { status: 500 }
    );
  } finally {
    if (db) db.end();
  }
}