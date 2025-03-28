import { connectToDatabase } from "../../../utils/dbConect";
import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  try {
    const db = await connectToDatabase();
    const url = new URL(request.url);
    
    const searchTerm = url.searchParams.get("search");
    const estado = url.searchParams.get("estado");

    // Si se realiza búsqueda avanzada, se usa una consulta simple
    if (searchTerm) {
      const query = `
        SELECT * 
        FROM docentes 
        WHERE 
          estado IN ('postulante') AND
          (
            LOWER(nombres) LIKE ? OR 
            LOWER(correo) LIKE ? OR 
            numeroDocumento LIKE ? OR 
            LOWER(estudiossuperiores) LIKE ? OR 
            LOWER(cursos) LIKE ?
          )
      `;
      const likeSearch = `%${searchTerm.toLowerCase()}%`;
      const [rows] = await db.query(query, [likeSearch, likeSearch, likeSearch, likeSearch, likeSearch]) as [any[], any];
      db.end();

      // Asumimos que aquí no se utilizan campos construidos con GROUP_CONCAT,
      // por lo que simplemente se retorna el arreglo de resultados.
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Condición por estado
    let estadoCondition = "estado IN ('postulante', 'aprobado', 'rechazado')";
    if (estado && ["postulante", "aprobado", "rechazado"].includes(estado)) {
      estadoCondition = `estado = '${estado}'`;
    }

    // Consulta principal (se reemplazan las funciones JSON por GROUP_CONCAT para cada campo)
    const query = `
SELECT 
    d.idDocente,
    d.apellidoMaterno,
    d.apellidoPaterno,
    d.nombres,
    d.numeroReferencia,
    d.correo,
    d.telefono,
    d.numeroDocumento,
    d.fechaNacimiento,
    d.ciudadRadicacion,
    d.genero,
    d.direccion,
    d.estado,
    d.fotografia,
    d.agendado,

    -- Sector
    COALESCE(CONCAT('{ "nombre": "', IFNULL(s.nombre, ''), '"}'), '{}') AS sector,

    -- País del docente
    COALESCE(CONCAT('{ "nombre": "', IFNULL(p.nombre, ''), '"}'), '{}') AS pais_docente,

    -- Tipo de documento
    COALESCE(CONCAT('{ "tipo": "', IFNULL(doc.tipo, ''), '"}'), '{}') AS tipo_documento,
      -- Profesion
    COALESCE(CONCAT('{ "profesion": "', IFNULL(pf.nombreProfesion, ''), '"}'), '{}') AS nombre_Profesion,

    -- Estudios superiores
    COALESCE(
        CASE
            WHEN COUNT(es.idEstudioSuperior) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idEstudio":"', IFNULL(es.idEstudioSuperior, ''), '", ',
                              '"idPais":"', IFNULL(es.idPais, ''), '", ',
                              '"idGrado":"', IFNULL(es.idGrado, ''), '", ',
                              '"idModalidad":"', IFNULL(es.idModalidad, ''), '", ',
                              '"tipo":"', IFNULL(te.tipo, ''), '", ',
                              '"carrera":"', IFNULL(es.carrera, ''), '", ',
                              '"nombre":"', IFNULL(es.nombre, ''), '", ',
                              '"universidad":"', IFNULL(es.universidad, ''), '", ',
                              '"pais":"', IFNULL(ep.nombre, ''), '", ',
                              '"fecha":"', IFNULL(es.fecha, ''), '", ',
                              '"modalidad":"', IFNULL(m.tipo, ''), '", ',
                              '"gradoTipo":"', IFNULL(g.tipo, ''), '", ',
                              '"idTipo":"', IFNULL(te.idTipoEstudio, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS estudiosuperiores,

    -- Experiencias docentes
    COALESCE(
        CASE
            WHEN COUNT(ed.idExperienciaDocente) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idExperiencia":"', IFNULL(ed.idExperienciaDocente, ''), '", ',
                              '"materia":"', IFNULL(ed.materia, ''), '", ',
                              '"calidad":"', IFNULL(ed.calidad, ''), '", ',
                              '"universidad":"', IFNULL(ed.universidad, ''), '", ',
                              '"concluidoEl":"', IFNULL(ed.concluidoEl, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS experienciasdocentes,

    -- Idiomas
    COALESCE(
        CASE
            WHEN COUNT(id.idIdiomaDocente) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idIdiomaDocente":"', IFNULL(id.idIdiomaDocente, ''), '", ',
                              '"idIdioma":"', IFNULL(id.idIdioma, ''), '", ',
                              '"idioma":"', IFNULL(i.idioma, ''), '", ',
                              '"escritura":"', IFNULL(id.escritura, ''), '", ',
                              '"oral":"', IFNULL(id.oral, ''), '", ',
                              '"lectura":"', IFNULL(id.lectura, ''), '", ',
                              '"escucha":"', IFNULL(id.escucha, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS idiomas,

    -- Habilidades blandas
    COALESCE(
        CASE
            WHEN COUNT(hb.idHabilidadBlanda) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idHabilidadBlanda":"', IFNULL(hb.idHabilidadBlanda, ''), '", ',
                              '"habilidad":"', IFNULL(hb.habilidad, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS habilidades_blandas,

    -- Experiencias laborales
    COALESCE(
        CASE
            WHEN COUNT(el.idExperienciaLaboral) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idExperienciaLaboral":"', IFNULL(el.idExperienciaLaboral, ''), '", ',
                              '"nombreEmpresa":"', IFNULL(el.nombreEmpresa, ''), '", ',
                              '"cargo":"', IFNULL(el.cargo, ''), '", ',
                              '"ciudad":"', IFNULL(el.ciudad, ''), '", ',
                              '"fechaInicio":"', IFNULL(el.fechaInicio, ''), '", ',
                              '"fechaFinal":"', IFNULL(el.fechaFinal, ''), '", ',
                              '"pais":"', IFNULL(epais.nombre, ''), '", ',
                              '"descripcion":"', IFNULL(el.descripcion, ''), '", ',
                              '"referencia": {',
                                '"idReferencia":"', IFNULL(r.idReferencia, ''), '", ',
                                '"nombreCompleto":"', IFNULL(r.nombreCompleto, ''), '", ',
                                '"cargoR":"', IFNULL(r.cargo, ''), '", ',
                                '"numeroContacto":"', IFNULL(r.numeroContacto, ''), '"',
                              '}',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS experienciaslaborales,

    -- Publicaciones intelectuales
    COALESCE(
        CASE
            WHEN COUNT(pi.idProduccionIntelectual) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idProduccionIntelectual":"', IFNULL(pi.idProduccionIntelectual, ''), '", ',
                              '"nombre":"', IFNULL(pi.nombre, ''), '", ',
                              '"enlaceEditorial":"', IFNULL(pi.enlaceEditorial, ''), '", ',
                              '"pais":"', IFNULL(pp.nombre, ''), '", ',
                              '"fecha":"', IFNULL(pi.fecha, ''), '", ',
                              '"tipoPublicacion":"', IFNULL(tp.tipo, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS publicacionesintelectuales,

    -- Agendas
    COALESCE(
        CASE
            WHEN COUNT(ag.idAgenda) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"fecha":"', IFNULL(DATE_FORMAT(ag.fecha, '%Y-%m-%d %H:%i:%s'), ''), '", ',
                              '"link":"', IFNULL(ag.linkZoom, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS agendas,

    -- Áreas
    COALESCE(
        CASE
            WHEN COUNT(ar.idArea) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idArea":"', IFNULL(ar.idArea, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS areas,

    -- Cursos
    COALESCE(
        CASE
            WHEN COUNT(c.idCurso) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"nombre":"', IFNULL(c.nombre, ''), '", ',
                              '"universidad":"', IFNULL(c.lugar, ''), '", ',
                              '"pais":"', IFNULL(p2.nombre, ''), '", ',
                              '"anio":"', IFNULL(c.fechaInicio, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS cursos

FROM 
    docentes d
     LEFT JOIN areas_docentes ad ON d.idDocente = ad.idDocente
    LEFT JOIN areas ar ON ad.idArea = ar.idArea
    LEFT JOIN sectores_docentes sd ON d.idDocente = sd.idDocente
    LEFT JOIN sectores s ON sd.idSector = s.idSector
    LEFT JOIN paises p ON d.idPais = p.idPais
    LEFT JOIN documentos doc ON d.idDocumento = doc.idDocumentos
    LEFT JOIN docentes_estudios de ON d.idDocente = de.idDocente
    LEFT JOIN estudiossuperiores es ON de.idEstudioSuperior = es.idEstudioSuperior
    LEFT JOIN tiposestudios te ON es.idTipoEstudio = te.idTipoEstudio
    LEFT JOIN modalidades m ON es.idModalidad = m.idModalidad
    LEFT JOIN grados g ON es.idGrado = g.idGrado
    LEFT JOIN paises ep ON es.idPais = ep.idPais  
    LEFT JOIN docente_experienciadocente ded ON d.idDocente = ded.idDocente
    LEFT JOIN experienciadocente ed ON ded.idExperienciaDocente = ed.idExperienciaDocente
    LEFT JOIN idiomas_docente id ON d.idDocente = id.idDocente
    LEFT JOIN idiomas i ON id.idIdioma = i.idIdioma
    LEFT JOIN habilidadesblandas hb ON d.idDocente = hb.idDocentes
    LEFT JOIN docente_experiencias dexp ON d.idDocente = dexp.idDocente
    LEFT JOIN experiencialaboral el ON dexp.idExperienciaLaboral = el.idExperienciaLaboral
    LEFT JOIN paises epais ON el.idPais = epais.idPais
    LEFT JOIN referencias r ON el.idReferencia = r.idReferencia
    LEFT JOIN docentes_publicacionesintelectuales dpi ON d.idDocente = dpi.idDocente
    LEFT JOIN produccionesintelectuales pi ON dpi.idProduccionIntelectual = pi.idProduccionIntelectual
    LEFT JOIN paises pp ON pi.idPais = pp.idPais
    LEFT JOIN tipospublicaciones tp ON pi.idTipoPublicacion = tp.idTipoPublicacion
    LEFT JOIN agendas ag ON d.idDocente = ag.idDocente
    LEFT JOIN docente_curso dc ON d.idDocente = dc.idDocente
    LEFT JOIN cursos c ON dc.idCurso = c.idCurso
    LEFT JOIN paises p2 ON c.idPais = p2.idPais
    LEFT JOIN profesiones pf ON d.idProfesion = pf.idProfesion
WHERE ${estadoCondition} 
GROUP BY d.idDocente;
    `;

    const [results] = await db.query(query) as [any[], any];
    db.end();

    // Procesamos cada fila para convertir los campos de GROUP_CONCAT a objetos/arrays
    const parsedResults = results.map((row) => {
      try {
        row.estudiosuperiores = JSON.parse(row.estudiosuperiores);
      } catch (e) {
        row.estudiosuperiores = [];
      }
      try {
        row.experienciasdocentes = JSON.parse(row.experienciasdocentes);
      } catch (e) {
        row.experienciasdocentes = [];
      }
      try {
        row.idiomas = JSON.parse(row.idiomas);
      } catch (e) {
        row.idiomas = [];
      }
      try {
        row.habilidades_blandas = JSON.parse(row.habilidades_blandas);
      } catch (e) {
        row.habilidades_blandas = [];
      }
      try {
        row.experienciaslaborales = JSON.parse(row.experienciaslaborales);
      } catch (e) {
        row.experienciaslaborales = [];
      }
      try {
        row.publicacionesintelectuales = JSON.parse(row.publicacionesintelectuales);
      } catch (e) {
        row.publicacionesintelectuales = [];
      }
      try {
        row.agendas = JSON.parse(row.agendas);
      } catch (e) {
        row.agendas = [];
      }
      try {
        row.areas = JSON.parse(row.areas);
      } catch (e) {
        row.areas = [];
      }
      try {
        row.cursos = JSON.parse(row.cursos);
      } catch (e) {
        row.cursos = [];
      }
      try {
        row.archivosDocente = JSON.parse(row.archivosDocente);
      } catch (e) {
        row.archivosDocente = [];
      }
      return row;
    });

    return new Response(JSON.stringify(parsedResults), { status: 200 });
  } catch (error) {
    console.error("Error al obtener los docentes postulantes:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener los docentes postulantes" }),
      { status: 500 }
    );
  }
}
