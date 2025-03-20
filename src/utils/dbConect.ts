import mysql from "mysql2/promise";

export async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection({
       host: "149.28.34.53",
    user: "acadcbba_vins",
      password: "Vins8039368",
      database: "acadcbba_esamdb",

    });

    console.log("Conexión a la base de datos establecida exitosamente.");
    return connection;
  } catch (error: any) {
    console.error("Error al conectar con la base de datos:", error.message);
    throw error;
  }

      //host: "localhost",
      //user: "root",
      //password: "",
      //database: "bd_esam",
}
