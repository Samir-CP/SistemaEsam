import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";
import * as fs from 'fs';
import * as path from 'path';

export async function POST({ request }: APIContext) {
  let db: any;

  try {
    // Leer el body del request como FormData
    const formData = await request.formData();
    const titulo = formData.get("titulo");
    const perfil = formData.get("perfil");
    const requisitos = formData.get("requisitos");
    const fechaInicio = formData.get("fechaInicio");
    const fechaFinal = formData.get("fechaFinal");
    const estado = formData.get("estado") || "abierta";
    const idAreaInteres = formData.get("idAreaInteres");
    const idSector = formData.get("idSector");
    const imagenPortada = formData.get("imagenPortada") as File;
    const formularioExterno = formData.get("formularioExterno");

    // Validar campos obligatorios
    if (!titulo || !perfil || !fechaInicio || !fechaFinal || !requisitos || !idAreaInteres || !idSector) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400 }
      );
    }

    // Validar fechas
    const fechaInicioDate = new Date(fechaInicio.toString());
    const fechaFinalDate = new Date(fechaFinal.toString());
    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinalDate.getTime())) {
      return new Response(
        JSON.stringify({ error: "Formato de fecha inválido" }),
        { status: 400 }
      );
    }

    // Convertir fechas a formato DATETIME (YYYY-MM-DD HH:MM:SS)
    const fechaInicioDateTime = fechaInicioDate.toISOString().slice(0, 19).replace("T", " ");
    const fechaFinalDateTime = fechaFinalDate.toISOString().slice(0, 19).replace("T", " ");

    // Generar la URL de la convocatoria para el campo 'link'
    const link = `http://localhost:4321/convocatorias/${encodeURIComponent(titulo.toString().trim())}`;

    // Procesar la imagen de portada
    let imagenPortadaPath = null;
    if (imagenPortada && imagenPortada.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'convocatorias');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const fileName = `${Date.now()}-${imagenPortada.name}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await imagenPortada.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      imagenPortadaPath = `/images/convocatorias/${fileName}`;
    }

    // Conectar a la base de datos
    db = await connectToDatabase();

    const query = `
      INSERT INTO convocatorias (
        titulo, perfil, link, requisitos, fechaInicio, fechaFinal, estado, idArea, idSector, imagenPortada, formularioExterno
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      titulo.toString().trim(),
      perfil.toString().trim(),
      link,  // Guardar la ruta completa en el campo 'link'
      requisitos?.toString().trim(),
      fechaInicioDateTime,
      fechaFinalDateTime,
      estado.toString().trim(),
      idAreaInteres.toString().trim(),
      idSector.toString().trim(),
      imagenPortadaPath,
      formularioExterno?.toString().trim() || null,
    ];

    await db.execute(query, values);

    return new Response(
      JSON.stringify({ message: "Convocatoria insertada correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al insertar la convocatoria:", error);
    return new Response(
      JSON.stringify({ error: "Error al insertar la convocatoria" }),
      { status: 500 }
    );
  } finally {
    if (db) db.end();
  }
}