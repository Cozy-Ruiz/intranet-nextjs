import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Connection } from "mysql2/promise";


async function getConnection() {
    return await mysql.createConnection({
        host: "192.1.172.9",
        port: 3306,
        user: "GEA",
        password: "7b1QqK#m1F3m",
        database: "transportes",
    });
}

export async function DELETE(req: Request) {
    let connection;

    try {
        const { searchParams } = new URL(req.url);
        const xn_id = searchParams.get("xn_id");
        const xt_referencia = searchParams.get("xt_referencia");
        const xt_pedimento = searchParams.get("xt_pedimento");

        if (!xn_id || !xt_referencia|| !xt_pedimento) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        connection = await getConnection();
        
        const [result]: any = await connection.execute(
            "DELETE FROM unidades_pedimentos WHERE xn_id = ? AND xt_referencia = ? AND xt_pedimento = ? ",
            [xn_id, xt_referencia, xt_pedimento]
        );

        // Retornar el transporte con sus pedimentos
        return NextResponse.json({
            message: "Pedimento eliminado correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar pedimento del trasporte", error);
        return NextResponse.json({ error: "Error al eliminar pedimento del trasporte" }, { status: 500 });
    }finally {
        if (connection) await connection.end();
    }
}