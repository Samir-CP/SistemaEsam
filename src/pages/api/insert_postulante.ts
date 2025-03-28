import { connectToDatabase } from "../../utils/dbConect";
import type { APIContext } from "astro";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'tu_clave_secreta'; // Debe coincidir con el de auth.ts

export async function POST({ request }: APIContext) {
  try {
    const formData = await request.formData();
    // Extraer los datos del formulario
    const usuario = formData.get("usuario")?.toString(); 
    const password = formData.get("password")?.toString();
    const nombres = formData.get("nombres")?.toString();
    const apellidoPaterno = formData.get("apellidoPaterno")?.toString();
    const apellidoMaterno = formData.get("apellidoMaterno")?.toString();
    const correo = formData.get("correo")?.toString();
    const ciudadRadicacion = formData.get("ciudadRadicacion")?.toString();
    const idPais = formData.get("idPais")?.toString();
    const idProfesion = formData.get("idProfesion")?.toString();
    const telefono = formData.get("telefono")?.toString();
    const fechaNacimiento = formData.get("fechaNacimiento")?.toString();
    const imagen = formData.get("fotografia") as File | null;

    // Validar los campos requeridos
    if (!usuario || !password || !nombres || !apellidoPaterno || !correo || 
        !ciudadRadicacion || !idPais || !idProfesion || !telefono || !fechaNacimiento) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400 }
      );
    }

    // Validar la contraseña
    const passwordRegex = /^(?=.*[0-9])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return new Response(
        JSON.stringify({
          error: "La contraseña debe tener al menos 8 caracteres y contener al menos un número.",
        }),
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password.trim(), 10); 

    // Guardar la imagen en el servidor
    let imagePath = null;
    if (imagen) {
      const uploadDir = path.join(process.cwd(), "public/images/docentes");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${imagen.name || "imagen"}`;
      const filePath = path.join(uploadDir, fileName);

      try {
        const buffer = Buffer.from(await imagen.arrayBuffer());
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
    
    // Conectar a la base de datos
    const db = await connectToDatabase();

    // Verificar si el usuario ya existe
    const [rows]: any = await db.execute(
      "SELECT COUNT(*) AS count FROM docentes WHERE usuario = ?",
      [usuario.trim()]
    );

    if (rows[0].count > 0) {
      db.end();
      return new Response(
        JSON.stringify({ error: "El usuario ya está registrado" }),
        { status: 400 }
      );
    }

    // Insertar nuevo docente
    const [result]: any = await db.execute(
      `INSERT INTO docentes (
        usuario, password, nombres, apellidoPaterno, apellidoMaterno, correo,
        ciudadRadicacion, idPais, idProfesion, telefono, fechaNacimiento,
        fotografia, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        usuario.trim(),
        hashedPassword,
        nombres.trim(),
        apellidoPaterno.trim(),
        apellidoMaterno?.trim() || null,
        correo.trim().toLowerCase(),
        ciudadRadicacion.trim(),
        Number(idPais),
        Number(idProfesion),
        telefono.trim(),
        fechaNacimiento.trim(),
        imagePath || null,
        "postulante",
      ]
    );

    const idDocente = result.insertId;

    // Generar token JWT (similar al de auth.ts pero con datos del nuevo registro)
    const token = jwt.sign(
      { 
        idDocente: idDocente,
        nombre: nombres.trim(),
        apellidoPaterno: apellidoPaterno.trim(),
        idRol: 4,
        idArea:null    
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    db.end();

    return new Response(
      JSON.stringify({ 
        message: "Registro exitoso",
        token: token,
        idDocente: idDocente,
        redirectTo: "/dashboardDoc" // Puedes usar esto en el frontend
      }),
      { 
        status: 200,
        headers: {
          'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
        }
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error en el servidor" }),
      { status: 500 }
    );
  }
}