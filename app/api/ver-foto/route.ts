import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Ajusta con tus datos de conexión
const dbConfig = {
  host: "192.1.172.9",
  port: 3306,
  user: "GEA",
  password: "7b1QqK#m1F3m",
  database: "transportes",
};

export async function GET(req: NextRequest) {
  // Extraer parámetro id de la query
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Falta el parámetro 'id'", { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Ajusta nombre de la tabla y columnas según tu estructura real
    // Suponemos que la tabla tiene columna 'foto_entrega' tipo BLOB y 'foto_entrega_mime' tipo VARCHAR opcional
    const [rows]: any = await connection.execute(
      "SELECT xt_foto FROM estatus_transportes WHERE xn_id = ?",
      [id]
    );

    if (!rows.length || !rows[0].xt_foto) {
      return new NextResponse("No existe la foto", { status: 404 });
    }

    const fotoBuffer = rows[0].xt_foto as Buffer;
    const fotoBytes = Uint8Array.from(fotoBuffer);
    const mimeType = "image/jpeg";

    return new NextResponse(fotoBytes, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400"
      },
    });

  } catch (error) {
    console.error("Error en ver-foto", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}