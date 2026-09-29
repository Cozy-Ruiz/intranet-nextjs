import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

async function getConnection() {
    return await mysql.createConnection({
        host: "192.1.172.9",
        port: 3306,
        user: "GEA",
        password: "7b1QqK#m1F3m",
        database: "transportes",
    });
}

export async function GET(req: Request) {
    let connection;

    try {
        connection = await getConnection();
        let transportes;

        // Obtener todos los transportes
        const [result]: [any[], any] = await connection.execute("SELECT * FROM registro_unidades");
        transportes = result;

        // Obtener pedimentos para cada transporte
        for (let transporte of transportes) {
            const [pedimentos]: [any[], any] = await connection.execute(
                "SELECT * FROM unidades_pedimentos WHERE xn_id = ?",
                [transporte.xn_id]
            );
            transporte.pedimentos = pedimentos; // Agregar pedimentos a cada transporte
        }

        return NextResponse.json(transportes);

    } catch (error) {
        console.error("Error al obtener transportes:", error);
        return NextResponse.json({ error: "Error al obtener transportes" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const xn_id = formData.get("xn_id");
  const xt_estatus = formData.get("xt_estatus");
  const xt_usuario = formData.get("xt_usuario");
  const foto = formData.get("foto"); // Blob

  if (!xn_id || !xt_estatus || !xt_usuario) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  // Si la imagen existe...
  let fotoBuffer: Buffer | null = null;
  if (foto && typeof foto === "object") {
    fotoBuffer = Buffer.from(await (foto as Blob).arrayBuffer());
  }

  let connection;
  try {
    connection = await getConnection();

    const [result]: any = await connection.execute(
      "INSERT INTO estatus_transportes (xn_id, xt_estatus, xt_usuario, xt_foto) VALUES (?, ?, ?, ?)",
      [xn_id, xt_estatus, xt_usuario, fotoBuffer]
    );

    return NextResponse.json({ message: "Estatus registrado correctamente", response: result });
  } catch (error) {
    return NextResponse.json({ error: "Error al registrar estatus" }, { status: 500 });
  } finally {
    if (connection) connection.end();
  }
}