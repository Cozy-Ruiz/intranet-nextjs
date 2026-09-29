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

export async function GET( request: NextRequest ) {

    let connection;

    try {
    connection = await getConnection();

    const id = request.nextUrl.pathname.split("/").pop();

    if (!id) {
        return NextResponse.json({ error: "Parámetro 'id' requerido" }, { status: 400 });
    }

    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Parámetro 'id' inválido" }, { status: 400 });
    }

    const [result]: [any[], any] = await connection.execute(
        "SELECT * FROM registro_unidades WHERE xn_id = ?",
        [id]
    );

    if (result.length === 0) {
        return NextResponse.json({ error: "Transporte no encontrado" }, { status: 404 });
    }

    const transporte = result[0];

    const [pedimentos]: [any[], any] = await connection.execute(
        "SELECT * FROM unidades_pedimentos WHERE xn_id = ?",
        [id]
    );

    transporte.pedimentos = pedimentos;

    return NextResponse.json(transporte);

    } catch (error) {
        console.error("Error al obtener transporte:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}

export async function POST(req: Request) {
    let connection;

    try {
        const body = await req.json();
        console.log(body);
        const { xn_id, pedimentos, xt_usuario } = body;

        if (!xn_id || !pedimentos || !xt_usuario) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        connection = await getConnection();

        // Insertar pedimentos si existen
        if (pedimentos.length > 0) {
            for (const pedimento of pedimentos) {

                const lineaCaptura = pedimento.split(" ")[0];

                const [resultReferencia]: any = await connection.execute(
                    "SELECT r.xt_referencia, p.kp_pedimento FROM validacion_pago_pece.referencias r, master_ge.master_pedimentos p WHERE r.XT_LINEA_CAPTURA = ? AND p.xt_referencia = r.XT_REFERENCIA",
                    [lineaCaptura]
                );
                
                await connection.execute(
                    "INSERT INTO unidades_pedimentos (xn_id, xt_referencia, xt_pedimento, xt_usuario) VALUES (?, ?, ?, ?)",
                    [xn_id, resultReferencia[0].xt_referencia, resultReferencia[0].kp_pedimento, xt_usuario]
                );
            }
        }

        return NextResponse.json({
            message: "Pedimentos registrados correctamente",
            xn_id,
            pedimentos
        });

    } catch (error) {
        console.error("Error al registar pedimentos", error);
        return NextResponse.json({ error: "Error al registar pedimentos" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}