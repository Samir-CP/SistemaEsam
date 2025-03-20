
import React from "react";
import { PDFDownloadLink, Document, Page, View, Text, Image, StyleSheet, Font} from "@react-pdf/renderer";
import "../../styles/postulantes.css";

const styles = StyleSheet.create({
  page: {
    margin: 10,
    paddingTop: 15,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  container: {
    flex:1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  leftColumn: {
    width: "35%",
    backgroundColor: "#1d2a44",
    color: "white",
    padding: 20,
    borderRight: "2px solid black",
    flexGrow:1,
  },
  profileImage: {
    borderRadius: 55,
    width: 110,
    height: 110,
    marginBottom: 20,
    borderWidth: 4,     
    borderColor: "#fdd835", 
    borderStyle: "solid"
  },
  leftColumnHeading: {
    fontSize: 14,
    marginBottom: 10,
  },
  leftColumnText: {
    marginVertical: 5,
    fontSize: 11,
   
  },
  rightColumn: {
    width: "65%",
    padding: 30,
  },
  rightColumnHeading: {
    fontSize: 16,
    color: "#1d2a44",
    marginBottom: 15,
    borderBottom: "1px solid #1d2a44",
    paddingBottom: 5,
  },
  rightColumnText: {
    marginVertical: 8,
    fontSize: 12,
    //fontFamily: 'Helvetica-Bold',
  },
  listItem: {
    marginBottom: 10,
    padding: 5,
    borderBottom: "1px solid #ddd",
  },

});

const PDFContent = ({ postulante }) => (
  <Document>
    <Page size="LEGAL" style={styles.page} wrap>
      <View style={styles.container}>

      
        <View style={styles.leftColumn}>
          <Image src={postulante.fotografia} style={styles.profileImage} />
          <Text style={styles.leftColumnHeading}><Image src="/images/iconos/usuario (1).png" style={styles.icon} /> {postulante.nombres}</Text>
          <Text style={styles.leftColumnText}><Image src="/images/iconos/carnet-de-identidad.png" style={styles.icon} /> {postulante.numeroDocumento}</Text>
          <Text style={styles.leftColumnText}><Image src="/images/iconos/pastel.png" style={styles.icon} /> Fecha de Nacimiento</Text>
          <Text style={styles.leftColumnText}><Image src="/images/iconos/sobre-de-papel-blanco.png" style={styles.icon} /> {postulante.correo}</Text>
          <Text style={styles.leftColumnText}><Image src="/images/iconos/telefono.png" style={styles.icon} /> {postulante.telefono}</Text>
          <Text style={styles.leftColumnText}><Image src="/images/iconos/genero.png" style={styles.icon} /> Género</Text>
          <Text style={styles.leftColumnText}><Image src="/images/iconos/mapa.png" style={styles.icon} /> Ciudad</Text>
          <Text style={styles.leftColumnText}><Image src="/images/iconos/ubicacion (2).png" style={styles.icon} /> Ubicación</Text>
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.rightColumnHeading}>Estudios Pregrado</Text>
          {postulante.estudiosuperiores && postulante.estudiosuperiores
    .filter((estudios) => estudios.tipo === "pregrado") // Filtrar solo los de tipo "pregrado"
    .map((estudios, index) => (
            <View key={index} style={styles.listItem} wrap={false}>
              <Text style={styles.rightColumnText}>
                Carrera: {estudios.carrera}
              </Text>
              <Text style={styles.rightColumnText}>
                Universidad: {estudios.universidad}
              </Text>
              <Text style={styles.rightColumnText}>País: {estudios.pais}</Text>
              <Text style={styles.rightColumnText}>Año: {estudios.fecha}</Text>
              <Text style={styles.rightColumnText}>
                Modalidad: {estudios.modalidad}
              </Text>
            </View>
          ))}

          <Text style={styles.rightColumnHeading}>Estudios Postgrado</Text>
          {postulante.estudiosuperiores && postulante.estudiosuperiores
    .filter((estudios) => estudios.tipo === "postgrado") // Filtrar solo los de tipo "pregrado"
    .map((estudios, index) => (
            <View key={index} style={styles.listItem} wrap={false}>
              <Text style={styles.rightColumnText}>
                Nombre: {estudios.nombre}
              </Text>
              <Text style={styles.rightColumnText}>
                Universidad: {estudios.universidad}
              </Text>
              <Text style={styles.rightColumnText}>País: {estudios.pais}</Text>
              <Text style={styles.rightColumnText}>Año: {estudios.fecha}</Text>
              <Text style={styles.rightColumnText}>
                Modalidad: {estudios.modalidad}
              </Text>
            </View>
          ))}

            <Text style={styles.rightColumnHeading}>Cursos</Text>
            {postulante.cursos?.map((cursos, index) => (
            <View key={index} style={styles.listItem} wrap={false}>
              <Text style={styles.rightColumnText}>Nombre: {cursos.nombre}</Text>
              <Text style={styles.rightColumnText}>Universidad: {cursos.universidad}</Text>
              <Text style={styles.rightColumnText}>País: {cursos.pais}</Text>
              <Text style={styles.rightColumnText}>Año: {cursos.anio}</Text>
            </View>
          ))}
            {/* Experiencias Docentes */}
            
          {postulante.experienciasdocentes && postulante.experienciasdocentes.length > 0 && (
            <View>
              <Text style={styles.rightColumnHeading}>Experiencias Docentes</Text>
              {postulante.experienciasdocentes.map((experienciasd, index) => (
                <View style={styles.listItem} key={index} wrap={false}>
                  <Text style={styles.rightColumnText}>Calidad: {experienciasd.calidad}</Text>
                  <Text style={styles.rightColumnText}>Materia: {experienciasd.materia}</Text>
                  <Text style={styles.rightColumnText}>Concluido: {experienciasd.concluidoEl}</Text>
                  <Text style={styles.rightColumnText}>Universidad: {experienciasd.universidad}</Text>
                </View>
              ))}
            </View>
          )}
             {/* Idiomas */}
            
          {postulante.idiomas && postulante.idiomas.length > 0 && (
            <View>
               <Text style={styles.rightColumnHeading}>Idiomas</Text>
              {postulante.idiomas.map((idiomas, index) => (
                <View style={styles.listItem} key={index} wrap={false}>
                  <Text style={styles.rightColumnText}>Idioma: {idiomas.idioma}</Text>
                  <Text style={styles.rightColumnText}>Oral: {idiomas.oral}</Text>
                  <Text style={styles.rightColumnText}>Escucha: {idiomas.escucha}</Text>
                  <Text style={styles.rightColumnText}>Lectura:{idiomas.lectura}</Text>
                  <Text style={styles.rightColumnText}>Escritura: {idiomas.escritura}</Text>
                </View>
              ))}
            </View>
          )}
            {/* Experiencia Laboral */}
           
          {postulante.experienciaslaborales && postulante.experienciaslaborales.length > 0 && (
            <View>
               <Text style={styles.rightColumnHeading}>Experiencia Laboral</Text>
              {postulante.experienciaslaborales.map((experienciasL, index) => (
                <View style={styles.listItem} key={index} wrap={false}>
                  <Text style={styles.rightColumnText}>Empresa: {experienciasL.nombreEmpresa}</Text>
                  <Text style={styles.rightColumnText}>Cargo: {experienciasL.cargo}</Text>
                  <Text style={styles.rightColumnText}>Ciudad: {experienciasL.ciudad}</Text>
                  <Text style={styles.rightColumnText}>Fecha de Inicio: {experienciasL.fechaInicio}</Text>
                  <Text style={styles.rightColumnText}>Fecha Final: {experienciasL.fechaFinal}</Text>
                  <Text style={styles.rightColumnText}>Pais: {experienciasL.pais}</Text>
                  <Text style={styles.rightColumnText}>Descripcion: {experienciasL.descripcion}</Text>
                  <Text style={styles.rightColumnText}>Referencias:</Text>
                  <Text style={styles.rightColumnText}>Nombre de referencia: {experienciasL.nombreCompleto}</Text>
                  <Text style={styles.rightColumnText}>Cargo: {experienciasL.cargoR}</Text>
                  <Text style={styles.rightColumnText}>NÚmero: {experienciasL.numeroContacto}</Text>
                </View>
              ))}
            </View>
          )}
              {/* Habilidades */}
             
          {postulante.habilidades_blandas && postulante.habilidades_blandas.length > 0 && (
            <View>
               <Text style={styles.rightColumnHeading}>Habilidades Blandas</Text>
              {postulante.habilidades_blandas.map((habilidadesB, index) => (
                <View style={styles.listItem} key={index} wrap={false}>
                  <Text style={styles.rightColumnText}>Habilidad:{habilidadesB.habilidad}</Text>
                </View>
              ))}
            </View>
          )}
                {/* Publicaciones Intelectuales */}
               
          {postulante.publicacionesintelectuales && postulante.publicacionesintelectuales.length > 0 && (          
            <View>
               <Text style={styles.rightColumnHeading}> Publicaciones Intelectuales </Text>
              {postulante.publicacionesintelectuales.map((publicacionesI, index) => (
                <View style={styles.listItem} key={index} wrap={false}>
                  <Text style={styles.rightColumnText}>Nombre: {publicacionesI.nombre}</Text>
                  <Text style={styles.rightColumnText}>Enlace de editorial: {publicacionesI.enlaceEditorial}</Text>
                  <Text style={styles.rightColumnText}>Pais: {publicacionesI.pais}</Text>
                  <Text style={styles.rightColumnText}>Fecha: {publicacionesI.fecha}</Text>
                  <Text style={styles.rightColumnText}>Tipo: {publicacionesI.tipo}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </View>
    </Page>
  </Document>
);

export const PostulantePDF = ({ postulante }) => (
  <div className="download-pdf-container"> {/* Contenedor principal */}
  <PDFDownloadLink
    document={<PDFContent postulante={postulante} />}
    fileName={`${postulante.nombres}_CV.pdf`}
  >
    {({ loading }) => (
      <button className="download-btn">
        <img src="/images/iconos/download-pdf.png" alt="Icono PDF" className="download-icon" />
        {loading ? "Generando PDF..." : ""}
      </button>
    )}
  </PDFDownloadLink>
</div>
);
