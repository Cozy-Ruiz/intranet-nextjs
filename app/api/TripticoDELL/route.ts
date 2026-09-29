import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
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

export async function GET(req: NextRequest) {
  const filePath = path.join(
    process.cwd(),
    'app',
    'Sistemas',
    'Links',
    'triptico_DELL',
    'utils',
    'TripticoDell.pdf'
  );

  try {
    const fileBuffer = await fs.readFile(filePath); // No especificar encoding, devuelve buffer binario

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="TripticoDELL.pdf"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error al leer el PDF:', error);
    return NextResponse.json(
      { error: 'PDF no encontrado o error al leer el archivo' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
    let connection;

    try {
        const body = await req.json();
        console.log(body);
        const { transportista, placa, operador } = body;

        if (!transportista || !placa || !operador) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        connection = await getConnection();
   
        await connection.execute(
            "INSERT INTO transportes.salidastripticodell (xt_transportista, xt_placa, xt_operador) VALUES (?, ?, ?)",
            [transportista, placa, operador]
        );
            
        return NextResponse.json({
            message: "Salida de transporte registrada correctamente",
            transportista,
            placa,
            operador
        });

    } catch (error) {
        console.error("Error al registar salida de transporte", error);
        return NextResponse.json({ error: "Error al registar salida de transporte" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}