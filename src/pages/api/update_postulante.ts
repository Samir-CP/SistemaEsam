import { connectToDatabase } from "../../utils/dbConect";
import type { APIContext } from "astro";
import fs from "fs";
import path from "path";

// Función para manejar valores nulos y undefined
const sanitizeValue = (value: any) => (value === undefined ? null : value);

export async function POST({ request }: APIContext) {
  try {
    // Leer el FormData desde la solicitud
    const formData = await request.formData();

    // Extraer los datos del formulario
    const idDocente = formData.get("idDocente")?.toString();
    const apellidoMaterno = formData.get("apellidoMaterno")?.toString();
    const apellidoPaterno = formData.get("apellidoPaterno")?.toString();
    const nombres = formData.get("nombres")?.toString();
    const numeroReferencia = formData.get("numeroReferencia")?.toString();
    const correo = formData.get("correo")?.toString();
    const telefono = formData.get("telefono")?.toString();
    const numeroDocumento = formData.get("numeroDocumento")?.toString();
    const fechaNacimiento = formData.get("fechaNacimiento")?.toString();
    const ciudadRadicacion = formData.get("ciudadRadicacion")?.toString();
    const genero = formData.get("genero")?.toString();
    const direccion = formData.get("direccion")?.toString();
    const estado = formData.get("estado")?.toString();
    const fotografia = formData.get("fotografia") as File | null;

    console.log("Datos recibidos en el servidor:", {
      idDocente,
      apellidoMaterno,
      apellidoPaterno,
      nombres,
      numeroReferencia,
      correo,
      telefono,
      numeroDocumento,
      fechaNacimiento,
      ciudadRadicacion,
      genero,
      direccion,
      estado,
      fotografia,
    });

    // Verificar campos obligatorios
    if (!idDocente || !nombres || !apellidoPaterno || !correo) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400 }
      );
    }

    // Conexión a la base de datos
    const db = await connectToDatabase();

    // Guardar la imagen en el servidor si se proporciona
    let imagePath = null;
    if (fotografia && fotografia instanceof File) {
      const uploadDir = path.join(process.cwd(), "public/images/docentes");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${fotografia.name || "imagen"}`;
      const filePath = path.join(uploadDir, fileName);

      try {
        // Leer la imagen y guardarla en el servidor
        const buffer = Buffer.from(await fotografia.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        imagePath = `/images/docentes/${fileName}`;
      } catch (err) {
        console.error("Error al guardar la imagen:", err);
        return new Response(
          JSON.stringify({ error: "Error al guardar la imagen" }),
          { status: 500 }
        );
      }
    }

    // Consulta para actualizar datos del docente
    const docenteQuery = `
      UPDATE docentes 
      SET 
        apellidoMaterno = ?, 
        apellidoPaterno = ?, 
        nombres = ?, 
        numeroReferencia = ?, 
        correo = ?, 
        telefono = ?, 
        numeroDocumento = ?, 
        fechaNacimiento = ?, 
        ciudadRadicacion = ?, 
        genero = ?, 
        direccion = ?, 
        estado = ?,
        fotografia = ?
      WHERE idDocente = ?;
    `;

    // Valores a actualizar
    const docenteValues = [
      sanitizeValue(apellidoMaterno?.trim()),
      sanitizeValue(apellidoPaterno?.trim()),
      sanitizeValue(nombres?.trim()),
      sanitizeValue(numeroReferencia?.trim()),
      sanitizeValue(correo?.trim().toLowerCase()),
      sanitizeValue(telefono?.trim()),
      sanitizeValue(numeroDocumento?.trim()),
      fechaNacimiento ? new Date(fechaNacimiento).toISOString().split("T")[0] : null,
      sanitizeValue(ciudadRadicacion?.trim()),
      sanitizeValue(genero?.trim()),
      sanitizeValue(direccion?.trim()),
      sanitizeValue(estado?.trim()),
      imagePath || null, // Si se proporcionó una nueva imagen, usa su ruta; de lo contrario, usa null
      sanitizeValue(idDocente),
    ];

    console.log("Actualizando docente con:", docenteValues);

    // Ejecución del query
    const [docenteResult]: any = await db.execute(docenteQuery, docenteValues);
    console.log("Resultado de actualización del docente:", docenteResult);

    // Cerrar conexión a la base de datos
    db.end();

    // Respuesta de éxito
    return new Response(
      JSON.stringify({ message: "Datos actualizados correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en el servidor:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar datos" }),
      { status: 500 }
    );
  }
}