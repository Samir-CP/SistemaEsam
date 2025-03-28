import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../utils/dbConect';
import jwt from 'jsonwebtoken'; 
import type { APIContext } from "astro";

interface Credentials {
  usuario: string;
  password: string;
}

const JWT_SECRET = 'tu_clave_secreta';  

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { usuario, password }: Credentials = body;

    // Conectar a la base de datos
    const db = await connectToDatabase();
    const query = 'SELECT * FROM docentes WHERE usuario = ?';
    const [results]: any = await db.query(query, [usuario]);

    if (results.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const docente = results[0];

    // Comparar contraseñas
    const match = await bcrypt.compare(password, docente.password);
    if (!match) {
      throw new Error('Contraseña incorrecta');
    }
    const [areas]: any = await db.query(
      'SELECT idArea FROM areas_docentes WHERE idDocente = ? LIMIT 1',
      [docente.idDocente]
    );

    const idArea = areas.length > 0 ? areas[0].idArea : null;
    // Generar el JWT con más información
    const token = jwt.sign(
      { 
        idDocente:docente.idDocente,
        email: docente.usuario,
        nombre: docente.nombres,
        apellidoPaterno:docente.apellidoPaterno,
        idRol:docente.idRol, 
        idArea:idArea
      },  
      JWT_SECRET,                  
      { expiresIn: '1h' }         
    );

    return new Response(
      JSON.stringify({ token }),  
      { status: 200 }
    );

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'Error desconocido' }), { status: 400 });
  }
}


export function authenticateToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return {
      success: false,
      response: new Response(JSON.stringify({ error: 'Acceso denegado. No se proporcionó un token.' }), { status: 401 }),
    };
  }

  try {
    // Decodifica el token usando jwt.verify
    const user = jwt.verify(token, JWT_SECRET);
    return { success: true, user }; // Retorna el usuario decodificado si el token es válido
  } catch (error) {
    return {
      success: false,
      response: new Response(JSON.stringify({ error: 'Token no válido.' }), { status: 403 }),
    };
  }
}

