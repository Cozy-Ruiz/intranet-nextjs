import { NextResponse } from "next/server";
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

export async function GET() {
    let connection;

    try {
        connection = await getConnection();
        const [rows] = await connection.execute("SELECT * FROM catalogo_unidades");
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error al obtener unidades:", error);
        return NextResponse.json({ error: "Error al obtener unidades" }, { status: 500 });
    }finally {
        if (connection) await connection.end();
    } 
}

export async function POST(req: Request) {
let connection;

    try {
        const body = await req.json();
        console.log(body);
        const { xt_placa, xt_unidad, xt_usuario } = body;

        if (!xt_placa || !xt_unidad || !xt_usuario) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        connection = await getConnection();
        const result = await connection.execute(
            "INSERT INTO catalogo_unidades (xt_placa, xt_unidad, xt_usuario) VALUES (?, ?, ?)",
            [xt_placa, xt_unidad, xt_usuario]
        );

        return NextResponse.json({ message: "Unidad registrada exitosamente", response: result});
    } catch (error) {
        console.error("Error al agregar unidad", error);
        return NextResponse.json({ error: "Error al agregar unidad" }, { status: 500 });
    }finally {
        if (connection) await connection.end();
    }
}

export async function DELETE(req: Request) {
    let connection;

    try {
        const { searchParams } = new URL(req.url);
        const xt_placa = searchParams.get("xt_placa");

        if (!xt_placa) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        connection = await getConnection();
        const result = await connection.execute(
            "DELETE FROM catalogo_unidades WHERE xt_placa = ?",
            [xt_placa]
        );

        return NextResponse.json({ message: "Unidad eliminada exitosamente", response: result });
    } catch (error) {
        console.error("Error al eliminar unidad:", error);
        return NextResponse.json({ error: "Error al eliminar unidad" }, { status: 500 });
    }finally {
        if (connection) await connection.end();
    }
}