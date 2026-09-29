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
    let connection

    try {
        connection = await getConnection();
        const [rows] = await connection.execute("SELECT * FROM operadores");
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error al obtener operadores:", error);
        return NextResponse.json({ error: "Error al obtener operadores" }, { status: 500 });
    }finally {
        if (connection) await connection.end();
    }
}

export async function POST(req: Request) {
    let connection;
    try {
        const body = await req.json();
        console.log(body);
        const { xt_operador, xt_usuario } = body;

        if (!xt_operador || !xt_usuario) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        connection = await getConnection();
        console.log("INSERT INTO operadores (xt_operador, xt_usuario) VALUES (?, ?)",
            [xt_operador, xt_usuario]);
        const result = await connection.execute(
            "INSERT INTO operadores (xt_operador, xt_usuario) VALUES (?, ?)",
            [xt_operador, xt_usuario]
        );

        return NextResponse.json({ message: "Operador registrado exitosamente", response: result});
    } catch (error) {
        console.error("Error al agregar operador", error);
        return NextResponse.json({ error: "Error al agregar operador" }, { status: 500 });
    }finally {
        if (connection) await connection.end();
    }
}

export async function DELETE(req: Request) {
    let connection;
    try {
        const { searchParams } = new URL(req.url);
        const xt_operador = searchParams.get("xt_operador");

        if (!xt_operador) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        connection = await getConnection();
        console.log("DELETE FROM operadores WHERE xt_operador = ?",
            [xt_operador]);
        const result = await connection.execute(
            "DELETE FROM operadores WHERE xt_operador = ?",
            [xt_operador]
        );

        return NextResponse.json({ message: "Operador eliminado exitosamente", response: result });
    } catch (error) {
        console.error("Error al eliminar operador:", error);
        return NextResponse.json({ error: "Error al eliminar operador" }, { status: 500 });
    }finally {
        if (connection) await connection.end();
    }
}